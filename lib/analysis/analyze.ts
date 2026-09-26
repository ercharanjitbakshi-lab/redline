import type { ModelClient } from "../model/client.ts";
import { clauseLibrary, type ClauseCategory, type FlagSeverity } from "./clause-library.ts";
import { locateVerbatim, normalizeWhitespace } from "./citation.ts";
import { protectionChecklist } from "./protection-checklist.ts";
import { buildPrompt } from "./prompt.ts";
import type {
  Check,
  ContextNote,
  Flag,
  ProtectionEntry,
  ProtectionStatus,
  RedLine,
  Report,
} from "./report.ts";

type Input = { documentText: string; redLines: RedLine[] };
type Deps = { model: ModelClient };

type Proposal = { category: string; sourceSentence: string; explanation: string };
type ProtectionAnswer = { status: ProtectionStatus; note: string };

const statuses: readonly ProtectionStatus[] = ["present", "absent", "partial"];

// A proposal that passed every check, with what is needed to sort it.
type Placed = Proposal & { entry: ClauseCategory; libraryIndex: number; position: number };

const severityRank: Record<FlagSeverity, number> = { severe: 0, high: 1, moderate: 2 };

const libraryByKey = new Map(clauseLibrary.map((entry, index) => [entry.key, { entry, index }]));

// Every flaggable category and every protection is a check that runs on
// every document.
const checksRun: Check[] = [
  ...clauseLibrary
    .filter((c) => c.severity !== "context-only")
    .map((c) => ({ kind: "clause" as const, key: c.key, name: c.name })),
  ...protectionChecklist.map((p) => ({ kind: "protection" as const, key: p.key, name: p.name })),
];

// The model proposes; this code disposes. Severity comes from the clause
// library, every quote is checked against the document, and ordering is
// fixed, so the same model output always gives the same Report.
export async function analyze({ documentText }: Input, { model }: Deps): Promise<Report> {
  if (normalizeWhitespace(documentText) === "") {
    throw new Error("The document has no text to analyze.");
  }

  const { summary, proposals, protections } = parseModelOutput(await model.complete(buildPrompt(documentText)));

  const placed: Placed[] = [];
  let dropped = 0;
  const seen = new Set<string>();

  for (const proposal of proposals) {
    const known = proposal && libraryByKey.get(proposal.category);
    const position = proposal ? locateVerbatim(proposal.sourceSentence, documentText) : -1;
    if (!proposal || !known || position === -1) {
      // Context notes are not flags; only lost flags count as dropped.
      if (known?.entry.severity !== "context-only") dropped++;
      continue;
    }

    const sourceSentence = normalizeWhitespace(proposal.sourceSentence);
    const key = `${proposal.category}\n${sourceSentence}`;
    if (seen.has(key)) continue;
    seen.add(key);

    placed.push({ ...proposal, sourceSentence, entry: known.entry, libraryIndex: known.index, position });
  }

  // Document order, then clause-library order for a sentence in two categories.
  placed.sort((a, b) => a.position - b.position || a.libraryIndex - b.libraryIndex);

  const flags: Flag[] = [];
  const contextNotes: ContextNote[] = [];
  for (const p of placed) {
    if (p.entry.severity === "context-only") {
      contextNotes.push({ sourceSentence: p.sourceSentence, category: p.category, note: p.explanation });
    } else {
      flags.push({
        sourceSentence: p.sourceSentence,
        severity: p.entry.severity,
        category: p.category,
        explanation: p.explanation,
        hitsRedLine: null,
      });
    }
  }
  // Stable sort: within a severity, flags keep document order.
  flags.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  // Built fresh from the checklist, in checklist order. Only key, name,
  // status and note: a source sentence the model sends has nowhere to go.
  const notInContract: ProtectionEntry[] = protectionChecklist.map((p) => {
    const answer = protections.get(p.key)!;
    return { key: p.key, name: p.name, status: answer.status, note: answer.note };
  });

  return {
    summary,
    flags,
    contextNotes,
    notInContract,
    clean: flags.length === 0,
    checksRun: checksRun.map((c) => ({ ...c })),
    droppedFlagCount: dropped,
  };
}

// Reads the model's JSON. Anything unreadable fails the whole analysis:
// garbage must never turn into an empty, clean-looking Report.
function parseModelOutput(text: string): {
  summary: string;
  proposals: (Proposal | null)[];
  protections: Map<string, ProtectionAnswer>;
} {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    parsed = null;
  }

  const output = parsed as { summary?: unknown; findings?: unknown; protections?: unknown } | null;
  if (
    start === -1 ||
    typeof output?.summary !== "string" ||
    output.summary.trim() === "" ||
    !Array.isArray(output.findings) ||
    !Array.isArray(output.protections)
  ) {
    throw new Error("The model's answer could not be read as an analysis.");
  }

  // First valid answer per key wins. Every protection needs one: reporting a
  // protection with no answer as absent would be a claim nobody made.
  const protections = new Map<string, ProtectionAnswer>();
  for (const p of output.protections) {
    const { key, status, note } = (p ?? {}) as Record<string, unknown>;
    if (
      typeof key === "string" &&
      !protections.has(key) &&
      statuses.includes(status as ProtectionStatus) &&
      typeof note === "string" &&
      note.trim() !== ""
    ) {
      protections.set(key, { status: status as ProtectionStatus, note: note.trim() });
    }
  }
  const unanswered = protectionChecklist.filter((p) => !protections.has(p.key));
  if (unanswered.length > 0) {
    throw new Error(
      `The model's answer could not be read as an analysis: no valid status for ${unanswered.map((p) => p.key).join(", ")}.`,
    );
  }

  const proposals = output.findings.map((f): Proposal | null => {
    const { category, sourceSentence, explanation } = (f ?? {}) as Record<string, unknown>;
    return typeof category === "string" &&
      typeof sourceSentence === "string" &&
      typeof explanation === "string"
      ? { category, sourceSentence, explanation }
      : null;
  });

  return { summary: output.summary.trim(), proposals, protections };
}
