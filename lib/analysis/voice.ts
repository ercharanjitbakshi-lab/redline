import type { ModelClient } from "../model/client.ts";
import { appearsVerbatim } from "./citation.ts";
import type { Report } from "./report.ts";

// Redline states what it knows and asks about what it doesn't; it never
// hedges (docs/adr/0005). This is enforced here, not only asked for in the
// prompt: every string Redline wrote itself is scanned, and a hedge is sent
// back to the model to be rewritten. If it survives, the analysis fails.
// Quoted contract text is the document's voice, not Redline's, and is not
// scanned.

const HEDGES: { word: string; pattern: RegExp }[] = [
  // "May" the month (next to a number) is not a hedge.
  { word: "may", pattern: /(?<!\d\s)\bmay\b(?!\s+\d)/i },
  { word: "might", pattern: /\bmight\b/i },
  // "couldn't" states a fact.
  { word: "could", pattern: /\bcould\b(?!n['’]t)/i },
  { word: "possibly", pattern: /\bpossibly\b/i },
  { word: "potentially", pattern: /\bpotential(ly)?\b/i },
  { word: "arguably", pattern: /\barguabl[ey]\b/i },
  { word: "perhaps", pattern: /\bperhaps\b/i },
  { word: "probably", pattern: /\bprobabl[ey]\b/i },
  { word: "likely", pattern: /\b(un)?likely\b/i },
  { word: "seems", pattern: /\bseem(s|ed|ingly)?\b/i },
  { word: "appears to", pattern: /\bappears? to\b/i },
  { word: "conceivably", pattern: /\bconceivabl[ey]\b/i },
  { word: "presumably", pattern: /\bpresumabl[ey]\b/i },
];

export const hedgeWords = HEDGES.map((h) => h.word);

// Quoted spans: straight or curly double quotes, and curly single quotes.
// Straight single quotes are left alone; they are usually apostrophes.
const QUOTED = /"([^"]+)"|“([^”]+)”|‘([^’]+)’/g;

// The hedge words in text, ignoring any quoted span that is verbatim contract
// text.
export function findHedges(text: string, documentText: string): string[] {
  const ownWords = text.replace(QUOTED, (span, a, b, c) =>
    appearsVerbatim(a ?? b ?? c, documentText) ? " " : span,
  );
  return HEDGES.filter((h) => h.pattern.test(ownWords)).map((h) => h.word);
}

// A string Redline wrote, and how to put a rewrite back.
type Prose = { id: string; get: () => string; set: (text: string) => void };

function proseIn(report: Report): Prose[] {
  return [
    { id: "summary", get: () => report.summary, set: (t) => (report.summary = t) },
    ...report.flags.map((f, i) => ({
      id: `flag-${i}`,
      get: () => f.explanation,
      set: (t: string) => (f.explanation = t),
    })),
    ...report.contextNotes.map((n, i) => ({
      id: `context-${i}`,
      get: () => n.note,
      set: (t: string) => (n.note = t),
    })),
    ...report.notInContract.map((e) => ({
      id: `protection-${e.key}`,
      get: () => e.note,
      set: (t: string) => (e.note = t),
    })),
  ];
}

const REWRITE_ROUNDS = 2;

const rewriteInstructions = `You edit the writing of a contract-review tool for freelancers. Each text below contains hedge words, which are banned. Rewrite each one so it states things directly. Keep the meaning, the facts and any quoted contract text exactly. Where the text is genuinely unsure of something, turn that part into a direct question to the freelancer instead of hedging. Do not use any of these words: ${hedgeWords.join(", ")}.

Reply with JSON only: {"rewrites": [{"id": string, "text": string}]}, one entry per text, same ids.`;

// Rewrites hedged prose in place. Throws if any hedge is left afterwards.
export async function enforceVoice(
  report: Report,
  documentText: string,
  model: ModelClient,
): Promise<void> {
  const prose = proseIn(report);
  const hedged = () =>
    prose
      .map((p) => ({ prose: p, hedges: findHedges(p.get(), documentText) }))
      .filter((p) => p.hedges.length > 0);

  for (let round = 0; round < REWRITE_ROUNDS; round++) {
    const offending = hedged();
    if (offending.length === 0) return;

    const texts = offending.map(({ prose: p, hedges }) => ({ id: p.id, text: p.get(), banned: hedges }));
    const reply = await model.complete({
      system: rewriteInstructions,
      user: JSON.stringify({ texts }),
    });

    for (const { id, text } of parseRewrites(reply)) {
      const target = offending.find((o) => o.prose.id === id);
      if (target && text.trim() !== "") target.prose.set(text.trim());
    }
  }

  const left = hedged();
  if (left.length > 0) {
    const detail = left.map((o) => `${o.prose.id} (${o.hedges.join(", ")})`).join("; ");
    throw new Error(`The analysis could not be written without hedge words: ${detail}.`);
  }
}

// An unreadable reply rewrites nothing; the re-scan then catches it.
function parseRewrites(text: string): { id: string; text: string }[] {
  try {
    const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
      rewrites?: unknown;
    };
    if (!Array.isArray(parsed.rewrites)) return [];
    return parsed.rewrites.filter(
      (r): r is { id: string; text: string } =>
        typeof r?.id === "string" && typeof r?.text === "string",
    );
  } catch {
    return [];
  }
}
