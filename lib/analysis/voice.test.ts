import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./analyze.ts";
import { findHedges } from "./voice.ts";
import { createFakeModelClient } from "../model/fake.ts";
import type { Prompt } from "../model/client.ts";
import { oneSidedContract } from "./fixtures.ts";
import { protectionChecklist } from "./protection-checklist.ts";
import type { Report } from "./report.ts";

const net90 = "Client shall pay each invoice within ninety (90) days of Client's approval of the related deliverables.";
const termination =
  "Client may terminate this Agreement at any time for any reason, and no further payment shall be due to Contractor.";

type Analysis = {
  summary?: string;
  findings?: { category: string; sourceSentence: string; explanation: string }[];
  protections?: { key: string; status: string; note: string }[];
};

const analysis = (overrides: Analysis = {}) =>
  JSON.stringify({
    summary: "A brand identity contract.",
    findings: [{ category: "payment-delayed-or-gated", sourceSentence: net90, explanation: "You wait 90 days." }],
    protections: protectionChecklist.map((p) => ({ key: p.key, status: "present", note: "Covered." })),
    ...overrides,
  });

// Answers the analysis first; after that, rewrites every text it is given
// with the supplied function.
function modelThatRewrites(first: string, rewrite: (text: string) => string) {
  return createFakeModelClient(first, ...Array(4).fill((prompt: Prompt) => {
    const { texts } = JSON.parse(prompt.user) as { texts: { id: string; text: string }[] };
    return JSON.stringify({ rewrites: texts.map((t) => ({ id: t.id, text: rewrite(t.text) })) });
  }));
}

const run = (model: ReturnType<typeof createFakeModelClient>) =>
  analyze({ documentText: oneSidedContract, redLines: [] }, { model });

// Every string Redline wrote, with the flags' quoted source sentences left out.
const ownProse = (r: Report) => [
  r.summary,
  ...r.flags.map((f) => f.explanation),
  ...r.contextNotes.map((n) => n.note),
  ...r.notInContract.map((e) => e.note),
];

const noHedges = (r: Report) =>
  assert.deepEqual(ownProse(r).flatMap((t) => findHedges(t, oneSidedContract)), []);

test("a hedge in a flag explanation is rewritten before the report returns", async () => {
  const report = await run(
    modelThatRewrites(
      analysis({ findings: [{ category: "payment-delayed-or-gated", sourceSentence: net90, explanation: "You might wait 90 days to be paid." }] }),
      (t) => t.replace("might wait", "wait"),
    ),
  );
  assert.equal(report.flags[0].explanation, "You wait 90 days to be paid.");
  noHedges(report);
});

test("the summary, context notes and every protection note are scanned too", async () => {
  const report = await run(
    modelThatRewrites(
      analysis({
        summary: "This could be a standard design contract.",
        findings: [
          {
            category: "work-for-hire-deliverable",
            sourceSentence: "Client will own the final logo and brand guidelines delivered under this Agreement.",
            explanation: "This is probably normal.",
          },
        ],
        protections: protectionChecklist.map((p) => ({ key: p.key, status: "absent", note: "This may leave you exposed." })),
      }),
      (t) => t.replace(/could be|probably|may leave/, (m) => ({ "could be": "is", probably: "", "may leave": "leaves" })[m]!).replace("  ", " "),
    ),
  );
  assert.equal(report.summary, "This is a standard design contract.");
  assert.equal(report.contextNotes[0].note, "This is normal.");
  assert.ok(report.notInContract.every((e) => e.note === "This leaves you exposed."));
  noHedges(report);
});

test("a hedge word inside the document's own quoted wording is left alone", async () => {
  // "may" appears in the contract's termination clause, quoted here.
  const explanation = `The clause says "${termination}" You get nothing if they walk away.`;
  const report = await run(
    createFakeModelClient(
      analysis({ findings: [{ category: "termination-without-payment", sourceSentence: termination, explanation }] }),
    ),
  );
  // The fake has one reply; a rewrite attempt would have failed the run.
  assert.equal(report.flags[0].explanation, explanation);
  assert.equal(report.flags[0].sourceSentence, termination);
});

test("a hedge inside quotes that are not contract text is still caught", () => {
  assert.deepEqual(findHedges(`As lawyers say, "this may be fine."`, oneSidedContract), ["may"]);
});

test("May the month and couldn't are not hedges", () => {
  assert.deepEqual(findHedges("Payment is due on 1 May and again on May 30. You couldn't stop it.", oneSidedContract), []);
});

test("common hedges are all caught", () => {
  for (const [text, word] of [
    ["This may hurt you.", "may"],
    ["It might hurt you.", "might"],
    ["It could be seen as unfair.", "could"],
    ["This is potentially costly.", "potentially"],
    ["Arguably one-sided.", "arguably"],
    ["It seems unfair.", "seems"],
    ["It appears to favour the client.", "appears to"],
    ["You will likely lose money.", "likely"],
  ]) {
    assert.deepEqual(findHedges(text, oneSidedContract), [word], text);
  }
});

test("a hedge that survives two rewrites fails the analysis", async () => {
  await assert.rejects(
    run(
      modelThatRewrites(
        analysis({ findings: [{ category: "payment-delayed-or-gated", sourceSentence: net90, explanation: "You might wait." }] }),
        (t) => t, // never fixes it
      ),
    ),
    /could not be written without hedge words: flag-0 \(might\)/,
  );
});

test("an unreadable rewrite changes nothing and the run fails", async () => {
  await assert.rejects(
    run(
      createFakeModelClient(
        analysis({ summary: "Perhaps a design contract." }),
        "not json",
        "still not json",
      ),
    ),
    /summary \(perhaps\)/,
  );
});

test("hedge-free output needs no rewrite", async () => {
  // One reply only: any rewrite call would fail the run.
  const report = await run(createFakeModelClient(analysis()));
  noHedges(report);
});

test("a marginal but citable finding is flagged, not filtered out", async () => {
  // The model marks its own call as marginal; there is no confidence gate.
  const report = await run(
    createFakeModelClient(
      JSON.stringify({
        summary: "s",
        findings: [
          {
            category: "payment-delayed-or-gated",
            sourceSentence: net90,
            explanation: "Close call: net 90 is common, but it is still three months of waiting.",
            confidence: "low",
            marginal: true,
          },
        ],
        protections: protectionChecklist.map((p) => ({ key: p.key, status: "present", note: "Covered." })),
      }),
    ),
  );
  assert.deepEqual(report.flags.map((f) => f.category), ["payment-delayed-or-gated"]);
});
