import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./analyze.ts";
import { createFakeModelClient } from "../model/fake.ts";
import { fairContract, oneSidedContract } from "./fixtures.ts";

type Finding = { category: string; sourceSentence: string; explanation: string };

const modelSays = (findings: Finding[], summary = "A brand identity contract.") =>
  createFakeModelClient(JSON.stringify({ summary, findings }));

const run = (model: ReturnType<typeof createFakeModelClient>, documentText = oneSidedContract) =>
  analyze({ documentText, redLines: [] }, { model });

// Quotes as a model would copy them: one line, no extraction line breaks.
const quotes = {
  preExisting:
    "All Work Product, together with any pre-existing tools, materials, and methods of Contractor incorporated therein, shall be the sole property of Client.",
  vests: "All right, title, and interest in the Work Product shall vest in Client immediately upon creation.",
  net90: "Client shall pay each invoice within ninety (90) days of Client's approval of the related deliverables.",
  termination:
    "Client may terminate this Agreement at any time for any reason, and no further payment shall be due to Contractor.",
  indemnity:
    "Contractor shall indemnify and hold harmless Client against any and all claims, losses, and expenses arising from or related to the Work Product.",
  nonCompete:
    "For twelve (12) months after this Agreement ends, Contractor shall not provide design services to any business in Client's industry.",
  workForHire: "Client will own the final logo and brand guidelines delivered under this Agreement.",
  confidentiality:
    "Each party shall keep the other party's non-public information confidential for two (2) years after this Agreement ends.",
};

// The model's findings in a deliberately jumbled order.
const fullFindings: Finding[] = [
  { category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "Blocks a year of work in your field." },
  { category: "payment-delayed-or-gated", sourceSentence: quotes.net90, explanation: "You wait three months after an approval with no deadline." },
  { category: "work-for-hire-deliverable", sourceSentence: quotes.workForHire, explanation: "Normal: the client owns what they paid for." },
  { category: "broad-indemnification", sourceSentence: quotes.indemnity, explanation: "You cover any claim with no limit." },
  { category: "termination-without-payment", sourceSentence: quotes.termination, explanation: "They can walk away owing nothing." },
  { category: "ip-vests-before-payment", sourceSentence: quotes.vests, explanation: "They own it before paying." },
  { category: "ip-pre-existing-work", sourceSentence: quotes.preExisting, explanation: "Your own tools become theirs." },
  { category: "mutual-limitation", sourceSentence: quotes.confidentiality, explanation: "Binds both sides equally." },
];

test("returns the summary and flags most severe first, each with its source, severity, category and explanation", async () => {
  const report = await run(modelSays(fullFindings, "Brand identity work for a client."));

  assert.equal(report.summary, "Brand identity work for a client.");
  assert.deepEqual(
    report.flags.map((f) => [f.severity, f.category]),
    [
      // Severe, in contract order.
      ["severe", "ip-pre-existing-work"],
      ["severe", "ip-vests-before-payment"],
      ["severe", "broad-indemnification"],
      ["high", "payment-delayed-or-gated"],
      ["high", "termination-without-payment"],
      ["moderate", "non-compete-exclusivity-non-solicit"],
    ],
  );
  const indemnity = report.flags.find((f) => f.category === "broad-indemnification");
  assert.deepEqual(indemnity, {
    sourceSentence: quotes.indemnity,
    severity: "severe",
    category: "broad-indemnification",
    explanation: "You cover any claim with no limit.",
    hitsRedLine: null,
  });
  assert.equal(report.clean, false);
  assert.equal(report.droppedFlagCount, 0);
});

test("severity comes from the clause library, not from the model", async () => {
  const report = await run(
    createFakeModelClient(
      JSON.stringify({
        summary: "s",
        findings: [{ category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e", severity: "severe" }],
      }),
    ),
  );
  assert.equal(report.flags[0].severity, "moderate");
});

test("a flag whose quote is not verbatim in the document is dropped and counted", async () => {
  const report = await run(
    modelSays([
      { category: "broad-indemnification", sourceSentence: quotes.indemnity, explanation: "Real quote." },
      // Paraphrased.
      { category: "ip-vests-before-payment", sourceSentence: "The client owns everything as soon as it is made.", explanation: "Made-up quote." },
      // Near miss: one word changed.
      { category: "payment-delayed-or-gated", sourceSentence: quotes.net90.replace("ninety", "sixty"), explanation: "Altered quote." },
    ]),
  );
  assert.deepEqual(report.flags.map((f) => f.category), ["broad-indemnification"]);
  assert.equal(report.droppedFlagCount, 2);
  assert.ok(report.flags.every((f) => f.explanation !== "Made-up quote."));
});

test("a quote spanning the document's line breaks survives", async () => {
  // quotes.preExisting spans three lines in the fixture.
  const report = await run(modelSays([fullFindings[6]]));
  assert.equal(report.flags.length, 1);
  assert.equal(report.flags[0].sourceSentence, quotes.preExisting);
});

test("a finding in a category Redline does not recognise is dropped and counted", async () => {
  const report = await run(
    modelSays([{ category: "made-up-category", sourceSentence: quotes.net90, explanation: "e" }]),
  );
  assert.equal(report.flags.length, 0);
  assert.equal(report.droppedFlagCount, 1);
});

test("a standard but one-sided clause is flagged: being common is no defence", async () => {
  // Net-90 after approval is common in freelance contracts.
  const report = await run(modelSays([fullFindings[1]]));
  assert.deepEqual(report.flags.map((f) => f.category), ["payment-delayed-or-gated"]);
});

test("an unusual but harmless clause the model leaves alone is not flagged", async () => {
  const report = await run(modelSays([fullFindings[3]]));
  assert.ok(report.flags.every((f) => !/USB drive/.test(f.sourceSentence)));
  assert.ok(report.contextNotes.every((n) => !/USB drive/.test(n.sourceSentence)));
});

test("plain work-for-hire goes to context notes, not flags", async () => {
  const report = await run(modelSays(fullFindings));
  assert.ok(report.flags.every((f) => f.category !== "work-for-hire-deliverable"));
  assert.deepEqual(report.contextNotes, [
    {
      sourceSentence: quotes.workForHire,
      category: "work-for-hire-deliverable",
      note: "Normal: the client owns what they paid for.",
    },
    {
      sourceSentence: quotes.confidentiality,
      category: "mutual-limitation",
      note: "Binds both sides equally.",
    },
  ]);
});

test("a context note whose quote is not verbatim is left out", async () => {
  const report = await run(
    modelSays([{ category: "work-for-hire-deliverable", sourceSentence: "The client owns the logo.", explanation: "Normal." }]),
  );
  assert.deepEqual(report.contextNotes, []);
});

test("a fair contract is clean, with no flags and every check listed", async () => {
  const report = await run(modelSays([], "Six blog posts on fair terms."), fairContract);
  assert.equal(report.clean, true);
  assert.deepEqual(report.flags, []);
  assert.equal(report.summary, "Six blog posts on fair terms.");
  assert.deepEqual(report.checksRun.map((c) => c.key), [
    "ip-pre-existing-work",
    "ip-vests-before-payment",
    "ip-moral-or-portfolio-rights",
    "uncapped-liability",
    "broad-indemnification",
    "termination-without-payment",
    "payment-delayed-or-gated",
    "non-compete-exclusivity-non-solicit",
    "unilateral-amendment",
  ]);
  assert.ok(report.checksRun.every((c) => c.name.length > 0));
});

test("checks are listed even when flags are found", async () => {
  const report = await run(modelSays(fullFindings));
  assert.equal(report.checksRun.length, 9);
});

test("clean is true exactly when every proposed flag was dropped", async () => {
  const report = await run(
    modelSays([{ category: "broad-indemnification", sourceSentence: "Not in the contract.", explanation: "e" }]),
  );
  assert.equal(report.clean, true);
  assert.equal(report.droppedFlagCount, 1);
});

test("the same sentence in the same category is reported once", async () => {
  const report = await run(modelSays([fullFindings[3], fullFindings[3]]));
  assert.equal(report.flags.length, 1);
});

test("one sentence can carry flags in two categories", async () => {
  const both = "Contractor shall indemnify and hold harmless Client against any and all claims";
  const report = await run(
    modelSays([
      { category: "broad-indemnification", sourceSentence: both, explanation: "a" },
      { category: "uncapped-liability", sourceSentence: both, explanation: "b" },
    ]),
  );
  assert.deepEqual(report.flags.map((f) => f.category), ["uncapped-liability", "broad-indemnification"]);
});

test("the same input and model output give an identical report five times", async () => {
  const reply = JSON.stringify({ summary: "s", findings: fullFindings });
  const reports = [];
  for (let i = 0; i < 5; i++) reports.push(await run(createFakeModelClient(reply)));
  for (const report of reports.slice(1)) assert.deepEqual(report, reports[0]);
});

test("model JSON wrapped in a code fence is still read", async () => {
  const fenced = "```json\n" + JSON.stringify({ summary: "s", findings: [fullFindings[3]] }) + "\n```";
  const report = await run(createFakeModelClient(fenced));
  assert.equal(report.flags.length, 1);
});

test("unreadable model output fails the analysis instead of returning a clean report", async () => {
  await assert.rejects(run(createFakeModelClient("Sorry, I can't help with that.")), /could not be read/);
  await assert.rejects(run(createFakeModelClient(JSON.stringify({ findings: [] }))), /could not be read/);
  await assert.rejects(run(createFakeModelClient(JSON.stringify({ summary: "s" }))), /could not be read/);
});

test("an empty document is refused before calling the model", async () => {
  await assert.rejects(run(createFakeModelClient("unused"), "  \n "), /no text/);
});
