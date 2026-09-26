import type { Prompt } from "../model/client.ts";
import { clauseLibrary } from "./clause-library.ts";
import { protectionChecklist } from "./protection-checklist.ts";
import type { RedLine } from "./report.ts";

// The instructions the model works from. The model's job is judgment: which
// clauses fail the asymmetry test, which category each belongs to, and what
// to say about it. Severity, ordering and citation checks happen in code
// afterwards and do not depend on the model.

const categoryGuide = clauseLibrary
  .map((c) =>
    [
      `- ${c.key} (${c.severity === "context-only" ? "context only, never a flag" : c.severity})`,
      `  Looks like: ${c.looksLike}`,
      `  Why: ${c.rationale}`,
      `  Fine when: ${c.notWhen}`,
    ].join("\n"),
  )
  .join("\n");

const protectionGuide = protectionChecklist
  .map((p) =>
    [
      `- ${p.key}: ${p.name}`,
      `  Without it: ${p.protectsAgainst}`,
      `  Present when: ${p.presentWhen}`,
      `  Partial when: ${p.partialWhen}`,
    ].join("\n"),
  )
  .join("\n");

const system = `You review freelance contracts for the freelancer, before they sign.

Find every clause that fails the asymmetry test: it lets the other party act on the freelancer with no reciprocal right, no cap, or no cure period, beyond what the deal justifies. Flag danger, not unusualness. A standard clause can be dangerous; being common is no defence. An unusual clause can be harmless; do not flag it for being unusual. When a clause is a close call and you can quote it, flag it.

Also report clauses in a "context only" category, so the freelancer can see they were read and are normal.

Categories (use these keys only):
${categoryGuide}

Rules for every finding:
- sourceSentence is copied character for character from the contract: the one sentence that carries the problem. Same words, punctuation and capitals. Do not paraphrase, shorten with "...", fix typos, or join text from different places.
- If one sentence has problems in two categories, report it once per category.
- redLineId is the id of the freelancer's red line the clause breaks (see below), or null.
- explanation says what the clause does to the freelancer and what to ask for instead, in two or three plain sentences. Write to the freelancer as "you" and to the other party as "the client". State it directly. Never use hedge words such as "may", "might", "could", "potentially" or "arguably".
  Example: "This clause gives the client ownership of the work the moment you create it, before you're paid. If they don't pay, you can't withhold the work. Ask for ownership to pass on full payment."

Then check the contract for each protection below. Judge by what the contract does, not its wording: a protection in unusual words is still present. Status is "present", "absent" or "partial". The note is one or two plain sentences to the freelancer as "you": for absent, say what is missing and what that leaves you exposed to; for partial, say what is covered and what is not; for present, say briefly what the contract gives you. Do not quote the contract in notes. Same rule on hedge words.

Protections (use these keys, one entry each):
${protectionGuide}

Also write summary: a plain-English paragraph of at most 150 words on what the contract is, who it binds, and what the freelancer agrees to. Describe; do not judge.

Reply with JSON only, no other text:
{"summary": string, "findings": [{"category": string, "sourceSentence": string, "explanation": string, "redLineId": string | null}], "protections": [{"key": string, "status": "present" | "absent" | "partial", "note": string}]}
If nothing needs flagging and nothing is context, findings is []. protections always has one entry per protection.`;

// Red lines are rules the freelancer set in advance. A breach is always
// reported, whether or not the clause fails the asymmetry test.
function redLineSection(redLines: RedLine[]): string {
  if (redLines.length === 0) return "The freelancer has set no red lines. redLineId is null on every finding.";
  const list = redLines.map((r) => `<red-line id="${r.id}">${r.text}</red-line>`).join("\n");
  return `The freelancer's red lines. For every clause that breaks one, report a finding with that redLineId, even if the clause passes the asymmetry test or is normally context only. Use the matching category above if there is one; if none fits, use category "red-line". Explain which rule it breaks and why.

${list}`;
}

export function buildPrompt(documentText: string, redLines: RedLine[]): Prompt {
  return {
    system,
    user: `${redLineSection(redLines)}\n\nThe contract:\n\n<contract>\n${documentText}\n</contract>`,
  };
}
