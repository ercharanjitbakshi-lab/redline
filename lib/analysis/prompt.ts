import type { Prompt } from "../model/client.ts";
import { clauseLibrary } from "./clause-library.ts";
import { protectionChecklist } from "./protection-checklist.ts";

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
- explanation says what the clause does to the freelancer and what to ask for instead, in two or three plain sentences. Write to the freelancer as "you" and to the other party as "the client". State it directly. Never use hedge words such as "may", "might", "could", "potentially" or "arguably".
  Example: "This clause gives the client ownership of the work the moment you create it, before you're paid. If they don't pay, you can't withhold the work. Ask for ownership to pass on full payment."

Then check the contract for each protection below. Judge by what the contract does, not its wording: a protection in unusual words is still present. Status is "present", "absent" or "partial". The note is one or two plain sentences to the freelancer as "you": for absent, say what is missing and what that leaves you exposed to; for partial, say what is covered and what is not; for present, say briefly what the contract gives you. Do not quote the contract in notes. Same rule on hedge words.

Protections (use these keys, one entry each):
${protectionGuide}

Also write summary: a plain-English paragraph of at most 150 words on what the contract is, who it binds, and what the freelancer agrees to. Describe; do not judge.

Reply with JSON only, no other text:
{"summary": string, "findings": [{"category": string, "sourceSentence": string, "explanation": string}], "protections": [{"key": string, "status": "present" | "absent" | "partial", "note": string}]}
If nothing needs flagging and nothing is context, findings is []. protections always has one entry per protection.`;

export function buildPrompt(documentText: string): Prompt {
  return {
    system,
    user: `The contract:\n\n<contract>\n${documentText}\n</contract>`,
  };
}
