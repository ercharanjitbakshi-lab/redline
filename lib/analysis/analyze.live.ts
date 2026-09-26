// The analyzer against the real pinned model, on the annotated fixtures.
// This checks the model's judgment, which the fake-model tests cannot.
// Costs a few cents. Run with: npm run test:live

import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./analyze.ts";
import { fairContract, marginalContract, oneSidedContract, unusualWordingContract } from "./fixtures.ts";
import { findHedges } from "./voice.ts";
import { modelConfig } from "../model/config.ts";
import { createOpenRouterClient } from "../model/openrouter.ts";
import type { Report } from "./report.ts";

const model = await createOpenRouterClient({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  config: modelConfig,
});

// Every live report must come back hedge-free in Redline's own prose.
function assertNoHedges(report: Report, documentText: string) {
  const own = [
    report.summary,
    ...report.flags.map((f) => f.explanation),
    ...report.contextNotes.map((n) => n.note),
    ...report.notInContract.map((e) => e.note),
  ];
  assert.deepEqual(own.flatMap((t) => findHedges(t, documentText)), [], "hedge words in Redline's own prose");
}

function show(label: string, report: Report) {
  console.log(`\n── ${label} ──`);
  console.log(`summary: ${report.summary}`);
  for (const f of report.flags) {
    const redLine = f.hitsRedLine ? ` (red line ${f.hitsRedLine})` : "";
    console.log(`  [${f.severity}] ${f.category}${redLine}: "${f.sourceSentence}"\n      ${f.explanation}`);
  }
  for (const n of report.contextNotes) console.log(`  (context) ${n.category}: "${n.sourceSentence}"`);
  for (const e of report.notInContract) console.log(`  <${e.status}> ${e.key}: ${e.note}`);
  console.log(`clean: ${report.clean}, dropped: ${report.droppedFlagCount}`);
}

test("live: the one-sided contract flags what a reviewer would, and only that", async () => {
  const report = await analyze({ documentText: oneSidedContract, redLines: [] }, { model });
  show("one-sided contract", report);
  assertNoHedges(report, oneSidedContract);
  const flagged = new Set(report.flags.map((f) => f.category));

  for (const expected of [
    "ip-pre-existing-work",
    "ip-vests-before-payment",
    "payment-delayed-or-gated", // standard net-90, still flagged
    "termination-without-payment",
    "non-compete-exclusivity-non-solicit",
  ]) {
    assert.ok(flagged.has(expected), `expected a ${expected} flag`);
  }
  assert.ok(
    flagged.has("broad-indemnification") || flagged.has("uncapped-liability"),
    "expected the uncapped indemnity to be flagged",
  );
  assert.ok(!report.flags.some((f) => /USB drive/.test(f.sourceSentence)), "the USB clause is unusual, not dangerous");
  assert.ok(!report.flags.some((f) => /final logo/.test(f.sourceSentence)), "plain work-for-hire is not a flag");
  assert.equal(report.flags[0].severity, "severe");

  const status = Object.fromEntries(report.notInContract.map((e) => [e.key, e.status]));
  for (const key of ["liability-cap", "pre-existing-ip-carve-out", "payment-on-termination", "acceptance-window"]) {
    assert.equal(status[key], "absent", `${key} is missing from this contract`);
  }
  // Net 90 is a deadline of sorts, with nothing for missing it.
  assert.notEqual(status["payment-deadline"], "present");
});

test("live: the fair contract comes back clean", async () => {
  const report = await analyze({ documentText: fairContract, redLines: [] }, { model });
  show("fair contract", report);
  assertNoHedges(report, fairContract);
  assert.equal(report.clean, true, `unexpected flags: ${report.flags.map((f) => f.category).join(", ")}`);
  assert.ok(report.checksRun.length > 0);
  const absent = report.notInContract.filter((e) => e.status === "absent").map((e) => e.key);
  assert.deepEqual(absent, [], "every protection is in the fair contract");
});

test("live: protections in unusual wording are not reported absent", async () => {
  const report = await analyze({ documentText: unusualWordingContract, redLines: [] }, { model });
  show("unusual wording contract", report);
  assertNoHedges(report, unusualWordingContract);
  const absent = report.notInContract.filter((e) => e.status === "absent").map((e) => e.key);
  assert.deepEqual(absent, [], "every protection is here, in unusual words");
});

test("live: red lines in the user's own words are matched to the clauses that break them", async () => {
  const redLines = [
    { id: "rl-compete", text: "I don't sign non-competes." },
    { id: "rl-digital", text: "Final files are delivered digitally, never on physical media." },
    { id: "rl-renewal", text: "No automatic renewal." },
  ];
  const report = await analyze({ documentText: oneSidedContract, redLines }, { model });
  show("one-sided contract with red lines", report);
  assertNoHedges(report, oneSidedContract);
  const hit = (id: string) => report.flags.filter((f) => f.hitsRedLine === id);

  const compete = hit("rl-compete");
  assert.equal(compete.length, 1, "the non-compete breaks rl-compete");
  assert.equal(compete[0].severity, "high", "moderate non-compete raised to high");
  assert.match(compete[0].sourceSentence, /twelve \(12\) months/);

  const digital = hit("rl-digital");
  assert.equal(digital.length, 1, "the USB clause breaks rl-digital");
  assert.match(digital[0].sourceSentence, /USB drive/);
  assert.equal(digital[0].severity, "high");

  assert.equal(hit("rl-renewal").length, 0, "nothing in the contract renews automatically");
});

test("live: a marginal but citable clause is flagged rather than passed over", async () => {
  const report = await analyze({ documentText: marginalContract, redLines: [] }, { model });
  show("marginal contract", report);
  assertNoHedges(report, marginalContract);
  const payment = report.flags.find((f) => f.category === "payment-delayed-or-gated");
  assert.ok(payment, "net 45 is past the 30-day line; the bias says flag it");
  assert.match(payment.sourceSentence, /forty-five \(45\) days/);
});
