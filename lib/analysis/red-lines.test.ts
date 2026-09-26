import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./analyze.ts";
import { createFakeModelClient } from "../model/fake.ts";
import { oneSidedContract } from "./fixtures.ts";
import { protectionChecklist } from "./protection-checklist.ts";
import type { RedLine } from "./report.ts";

type Finding = { category: string; sourceSentence: string; explanation: string; redLineId?: string | null };

const protections = protectionChecklist.map((p) => ({ key: p.key, status: "present", note: "Covered." }));

const run = (findings: Finding[], redLines: RedLine[]) =>
  analyze(
    { documentText: oneSidedContract, redLines },
    { model: createFakeModelClient(JSON.stringify({ summary: "s", findings, protections })) },
  );

const quotes = {
  nonCompete:
    "For twelve (12) months after this Agreement ends, Contractor shall not provide design services to any business in Client's industry.",
  vests: "All right, title, and interest in the Work Product shall vest in Client immediately upon creation.",
  net90: "Client shall pay each invoice within ninety (90) days of Client's approval of the related deliverables.",
  workForHire: "Client will own the final logo and brand guidelines delivered under this Agreement.",
  usb: "Contractor shall deliver final files on a USB drive labelled with the project name and date.",
};

const noNonCompetes: RedLine = { id: "rl-1", text: "No non-competes of any length." };
const payOnTime: RedLine = { id: "rl-2", text: "Paid within 30 days of invoice." };

test("a clause that breaks a red line carries that red line's id", async () => {
  const report = await run(
    [{ category: "payment-delayed-or-gated", sourceSentence: quotes.net90, explanation: "e", redLineId: "rl-2" }],
    [noNonCompetes, payOnTime],
  );
  assert.equal(report.flags[0].hitsRedLine, "rl-2");
});

test("a red-line hit is raised to at least high", async () => {
  // Non-compete is moderate in the clause library.
  const report = await run(
    [{ category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e", redLineId: "rl-1" }],
    [noNonCompetes],
  );
  assert.equal(report.flags[0].severity, "high");
});

test("a severe red-line hit stays severe", async () => {
  const report = await run(
    [{ category: "ip-vests-before-payment", sourceSentence: quotes.vests, explanation: "e", redLineId: "rl-1" }],
    [noNonCompetes],
  );
  assert.equal(report.flags[0].severity, "severe");
});

test("a red-line hit on a context-only clause becomes a high flag, not a note", async () => {
  const ownNothing: RedLine = { id: "rl-3", text: "I keep ownership of everything I make." };
  const report = await run(
    [{ category: "work-for-hire-deliverable", sourceSentence: quotes.workForHire, explanation: "e", redLineId: "rl-3" }],
    [ownNothing],
  );
  assert.deepEqual(report.contextNotes, []);
  assert.deepEqual(report.flags.map((f) => [f.category, f.severity, f.hitsRedLine]), [
    ["work-for-hire-deliverable", "high", "rl-3"],
  ]);
  assert.equal(report.clean, false);
});

test("a red-line hit outside every built-in category is flagged high under red-line", async () => {
  const noUsb: RedLine = { id: "rl-4", text: "Digital delivery only; no physical media." };
  const report = await run(
    [{ category: "red-line", sourceSentence: quotes.usb, explanation: "You asked for digital delivery only.", redLineId: "rl-4" }],
    [noUsb],
  );
  assert.deepEqual(report.flags, [
    {
      sourceSentence: quotes.usb,
      severity: "high",
      category: "red-line",
      explanation: "You asked for digital delivery only.",
      hitsRedLine: "rl-4",
    },
  ]);
});

test("a red-line hit sorts with the high flags, ahead of moderate ones", async () => {
  const report = await run(
    [
      { category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e" },
      { category: "red-line", sourceSentence: quotes.usb, explanation: "e", redLineId: "rl-4" },
    ],
    [{ id: "rl-4", text: "Digital delivery only." }],
  );
  assert.deepEqual(report.flags.map((f) => f.category), ["red-line", "non-compete-exclusivity-non-solicit"]);
});

test("a red-line hit whose quote is not verbatim is still dropped and counted", async () => {
  const report = await run(
    [{ category: "red-line", sourceSentence: "Files go on a USB stick.", explanation: "e", redLineId: "rl-4" }],
    [{ id: "rl-4", text: "Digital delivery only." }],
  );
  assert.deepEqual(report.flags, []);
  assert.equal(report.droppedFlagCount, 1);
});

test("a red-line id the user never supplied is ignored", async () => {
  const report = await run(
    [
      { category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e", redLineId: "rl-999" },
      { category: "red-line", sourceSentence: quotes.usb, explanation: "e", redLineId: "rl-999" },
    ],
    [noNonCompetes],
  );
  assert.deepEqual(report.flags.map((f) => [f.category, f.severity, f.hitsRedLine]), [
    ["non-compete-exclusivity-non-solicit", "moderate", null],
  ]);
  assert.equal(report.droppedFlagCount, 1);
});

test("a clause that matches no red line keeps its severity and a null hitsRedLine", async () => {
  const report = await run(
    [
      { category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e", redLineId: null },
      { category: "payment-delayed-or-gated", sourceSentence: quotes.net90, explanation: "e", redLineId: "rl-2" },
    ],
    [noNonCompetes, payOnTime],
  );
  const nonCompete = report.flags.find((f) => f.category === "non-compete-exclusivity-non-solicit")!;
  assert.equal(nonCompete.severity, "moderate");
  assert.equal(nonCompete.hitsRedLine, null);
});

test("with no red lines, every flag has a null hitsRedLine and a red-line id changes nothing", async () => {
  const findings: Finding[] = [
    { category: "non-compete-exclusivity-non-solicit", sourceSentence: quotes.nonCompete, explanation: "e" },
    { category: "work-for-hire-deliverable", sourceSentence: quotes.workForHire, explanation: "normal" },
  ];
  const plain = await run(findings, []);
  const withStrayIds = await run(findings.map((f) => ({ ...f, redLineId: "rl-1" })), []);
  assert.deepEqual(withStrayIds, plain);
  assert.ok(plain.flags.every((f) => f.hitsRedLine === null));
  assert.equal(plain.flags[0].severity, "moderate");
  assert.equal(plain.contextNotes.length, 1);
});

test("each red line is listed as a check that ran", async () => {
  const report = await run([], [noNonCompetes, payOnTime]);
  assert.deepEqual(
    report.checksRun.filter((c) => c.kind === "red-line"),
    [
      { kind: "red-line", key: "rl-1", name: "No non-competes of any length." },
      { kind: "red-line", key: "rl-2", name: "Paid within 30 days of invoice." },
    ],
  );
});
