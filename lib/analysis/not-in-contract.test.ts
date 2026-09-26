import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./analyze.ts";
import { createFakeModelClient } from "../model/fake.ts";
import { oneSidedContract } from "./fixtures.ts";
import { protectionChecklist } from "./protection-checklist.ts";

type Answer = { key: string; status: string; note: string; [extra: string]: unknown };

const keys = protectionChecklist.map((p) => p.key);

const answers = (overrides: Record<string, Partial<Answer>> = {}): Answer[] =>
  keys.map((key) => ({ key, status: "present", note: `The contract covers ${key}.`, ...overrides[key] }));

const run = (protections: unknown[]) =>
  analyze(
    { documentText: oneSidedContract, redLines: [] },
    { model: createFakeModelClient(JSON.stringify({ summary: "s", findings: [], protections })) },
  );

test("every protection gets exactly one entry, in checklist order, with a status and a note", async () => {
  const report = await run(answers());
  assert.deepEqual(report.notInContract.map((e) => e.key), keys);
  for (const entry of report.notInContract) {
    assert.ok(["present", "absent", "partial"].includes(entry.status));
    assert.ok(entry.note.length > 0);
    assert.equal(entry.name, protectionChecklist.find((p) => p.key === entry.key)!.name);
  }
});

test("a missing protection is reported absent, with the note saying what is missing", async () => {
  const note = "Nothing caps what you owe the client. One dispute can cost more than the whole fee.";
  const report = await run(answers({ "liability-cap": { status: "absent", note } }));
  const cap = report.notInContract.find((e) => e.key === "liability-cap");
  assert.deepEqual(cap, { key: "liability-cap", name: "A cap on your liability", status: "absent", note });
});

test("partial is kept as partial", async () => {
  const report = await run(answers({ "payment-deadline": { status: "partial", note: "A deadline, but no penalty." } }));
  assert.equal(report.notInContract.find((e) => e.key === "payment-deadline")!.status, "partial");
});

test("no entry carries a source sentence, even when the model sends one", async () => {
  const report = await run(
    answers({
      "acceptance-window": {
        status: "absent",
        note: "No approval deadline.",
        sourceSentence: "Client shall pay each invoice within ninety (90) days of Client's approval of the related deliverables.",
        severity: "high",
      },
    }),
  );
  for (const entry of report.notInContract) {
    assert.deepEqual(Object.keys(entry).sort(), ["key", "name", "note", "status"]);
  }
});

test("the section stays out of flags, and its entries share no shape with a flag", async () => {
  const report = await run(answers({ "liability-cap": { status: "absent", note: "No cap." } }));
  assert.deepEqual(report.flags, []);
  assert.equal(report.clean, true, "a missing protection is not a flag and does not make the result unclean");
  for (const entry of report.notInContract) {
    assert.equal("sourceSentence" in entry, false);
    assert.equal("severity" in entry, false);
    assert.equal("category" in entry, false);
  }
});

test("each protection is listed as a check that ran", async () => {
  const report = await run(answers());
  assert.deepEqual(report.checksRun.filter((c) => c.kind === "protection").map((c) => c.key), keys);
});

test("a protection the model did not answer fails the analysis rather than defaulting to absent", async () => {
  const withoutCap = answers().filter((a) => a.key !== "liability-cap");
  await assert.rejects(run(withoutCap), /no valid status for liability-cap/);
});

test("an unknown status or an empty note fails the analysis", async () => {
  await assert.rejects(run(answers({ "liability-cap": { status: "unclear" } })), /liability-cap/);
  await assert.rejects(run(answers({ "acceptance-window": { note: "  " } })), /acceptance-window/);
});

test("answers for protections not on the checklist are ignored, and the first answer per key wins", async () => {
  const report = await run([
    ...answers({ "liability-cap": { status: "absent", note: "First." } }),
    { key: "liability-cap", status: "present", note: "Second." },
    { key: "made-up-protection", status: "absent", note: "Ignored." },
  ]);
  assert.equal(report.notInContract.length, keys.length);
  assert.equal(report.notInContract.find((e) => e.key === "liability-cap")!.note, "First.");
});
