import type { ModelClient } from "../model/client.ts";
import { clauseLibrary, type FlagSeverity, type Severity } from "./clause-library.ts";
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

type Proposal = {
  category: string;
  sourceSentence: string;
  explanation: string;
  redLineId: string | null;
};
type ProtectionAnswer = { status: ProtectionStatus; note: string };

const statuses: readonly ProtectionStatus[] = ["present", "absent", "partial"];

// The category for a clause that breaks one of the user's red lines without
// fitting any built-in category. It sorts after every library category.
const RED_LINE = "red-line";

// A proposal that passed every check, with what is needed to sort it.
type Placed = Omit<Proposal, "redLineId"> & {
  severity: Severity;
  hitsRedLine: string | null;
  libraryIndex: number;
  position: number;
};

const severityRank: Record<FlagSeverity, number> = { severe: 0, high: 1, moderate: 2 };

const libraryByKey = new Map(clauseLibrary.map((entry, index) => [entry.key, { entry, index }]));

// Every flaggable category and every protection is a check that runs on
// every document.
const builtInChecks: Check[] = [
  ...clauseLibrary
    .filter((c) => c.severity !== "context-only")
    .map((c) => ({ kind: "clause" as const, key: c.key, name: c.name })),
  ...protectionChecklist.map((p) => ({ kind: "protection" as const, key: p.key, name: p.name })),
];

// The built-in severity and sort position for a proposed category, or null
// if Redline does not recognise it. "red-line" is valid only on a real hit.
function resolveCategory(
  key: string,
  hitsRedLine: string | null,
): { severity: Severity; index: number } | null {
  const known = libraryByKey.get(key);
  if (known) return { severity: known.entry.severity, index: known.index };
  if (key === RED_LINE && hitsRedLine) return { severity: "high", index: clauseLibrary.length };
  return null;
}

// A red-line hit is never below high, and never a mere context note.
function floorForRedLine(severity: Severity): FlagSeverity {
  return severity === "severe" ? "severe" : "high";
}

// The model proposes; this code disposes. Severity comes from the clause
// library, every quote is checked against the document, and ordering is
// fixed, so the same model output always gives the same Report.
export async function analyze({ documentText, redLines }: Input, { model }: Deps): Promise<Report> {
  if (normalizeWhitespace(documentText) === "") {
    throw new Error("The document has no text to analyze.");
  }

  const { summary, proposals, protections } = parseModelOutput(
    await model.complete(buildPrompt(documentText, redLines)),
  );
  const redLineIds = new Set(redLines.map((r) => r.id));

  const placed: Placed[] = [];
  let dropped = 0;
  const seen = new Set<string>();

  for (const proposal of proposals) {
    // A red-line id the user did not supply is ignored, not trusted.
    const hitsRedLine =
      proposal?.redLineId && redLineIds.has(proposal.redLineId) ? proposal.redLineId : null;
    const category = proposal ? resolveCategory(proposal.category, hitsRedLine) : null;
    const position = proposal ? locateVerbatim(proposal.sourceSentence, documentText) : -1;

    if (!proposal || !category || position === -1) {
      // Only lost flags count as dropped; a lost context note was never a flag.
      if (!(category?.severity === "context-only" && !hitsRedLine)) dropped++;
      continue;
    }

    const sourceSentence = normalizeWhitespace(proposal.sourceSentence);
    const key = `${proposal.category}\n${sourceSentence}`;
    if (seen.has(key)) continue;
    seen.add(key);

    placed.push({
      category: proposal.category,
      sourceSentence,
      explanation: proposal.explanation,
      severity: hitsRedLine ? floorForRedLine(category.severity) : category.severity,
      hitsRedLine,
      libraryIndex: category.index,
      position,
    });
  }

  // Document order, then clause-library order for a sentence in two categories.
  placed.sort((a, b) => a.position - b.position || a.libraryIndex - b.libraryIndex);

  const flags: Flag[] = [];
  const contextNotes: ContextNote[] = [];
  for (const p of placed) {
    if (p.severity === "context-only") {
      contextNotes.push({ sourceSentence: p.sourceSentence, category: p.category, note: p.explanation });
    } else {
      flags.push({
        sourceSentence: p.sourceSentence,
        severity: p.severity,
        category: p.category,
        explanation: p.explanation,
        hitsRedLine: p.hitsRedLine,
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
    checksRun: [
      ...builtInChecks.map((c) => ({ ...c })),
      ...redLines.map((r) => ({ kind: "red-line" as const, key: r.id, name: r.text })),
    ],
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
    const { category, sourceSentence, explanation, redLineId } = (f ?? {}) as Record<string, unknown>;
    return typeof category === "string" &&
      typeof sourceSentence === "string" &&
      typeof explanation === "string"
      ? { category, sourceSentence, explanation, redLineId: typeof redLineId === "string" ? redLineId : null }
      : null;
  });

  return { summary: output.summary.trim(), proposals, protections };
}
