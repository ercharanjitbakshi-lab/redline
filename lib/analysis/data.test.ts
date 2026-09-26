import { test } from "node:test";
import assert from "node:assert/strict";
import { clauseLibrary } from "./clause-library.ts";
import { protectionChecklist } from "./protection-checklist.ts";

test("every clause category has a severity and a written rationale", () => {
  for (const c of clauseLibrary) {
    assert.ok(["severe", "high", "moderate", "context-only"].includes(c.severity), c.key);
    for (const field of [c.name, c.looksLike, c.rationale, c.notWhen]) {
      assert.ok(field.trim().length > 0, c.key);
    }
  }
});

test("clause category keys are unique", () => {
  const keys = clauseLibrary.map((c) => c.key);
  assert.equal(new Set(keys).size, keys.length);
});

test("plain work-for-hire is context-only, and the IP sharp edges are severe", () => {
  const byKey = new Map(clauseLibrary.map((c) => [c.key, c]));
  assert.equal(byKey.get("work-for-hire-deliverable")?.severity, "context-only");
  for (const key of ["ip-pre-existing-work", "ip-vests-before-payment", "ip-moral-or-portfolio-rights"]) {
    assert.equal(byKey.get(key)?.severity, "severe", key);
  }
});

test("every checklist protection has a key and says what it protects against", () => {
  const keys = protectionChecklist.map((p) => p.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const p of protectionChecklist) {
    for (const field of [p.key, p.name, p.protectsAgainst, p.presentWhen, p.partialWhen]) {
      assert.ok(field.trim().length > 0, p.key);
    }
  }
});
