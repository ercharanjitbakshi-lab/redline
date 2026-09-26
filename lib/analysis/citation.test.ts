import { test } from "node:test";
import assert from "node:assert/strict";
import { appearsVerbatim, locateInOriginal } from "./citation.ts";

const contract = `7. Intellectual Property.
All work product, including any pre-existing materials incorporated
into the Deliverables, shall be the sole property of the Client upon
creation.   Contractor waives all moral rights in the Deliverables.

8. Payment. Client shall pay invoices within ninety (90) days of approval.`;

test("exact substring match returns true", () => {
  assert.equal(
    appearsVerbatim("Contractor waives all moral rights in the Deliverables.", contract),
    true,
  );
});

test("differing whitespace and line breaks still match", () => {
  assert.equal(
    appearsVerbatim(
      "  Client shall pay invoices\n within   ninety (90) days\tof approval. ",
      contract,
    ),
    true,
  );
});

test("a sentence spanning a line break in the document matches", () => {
  assert.equal(
    appearsVerbatim(
      "All work product, including any pre-existing materials incorporated into the Deliverables, shall be the sole property of the Client upon creation.",
      contract,
    ),
    true,
  );
});

test("a sentence spanning irregular spacing in the document matches", () => {
  assert.equal(
    appearsVerbatim(
      "upon creation. Contractor waives all moral rights",
      contract,
    ),
    true,
  );
});

test("a punctuation difference returns false", () => {
  assert.equal(
    appearsVerbatim("Client shall pay invoices within ninety 90 days of approval.", contract),
    false,
  );
  assert.equal(
    appearsVerbatim("Contractor waives all moral rights in the Deliverables!", contract),
    false,
  );
});

test("a case difference returns false", () => {
  assert.equal(
    appearsVerbatim("contractor waives all moral rights in the Deliverables.", contract),
    false,
  );
});

test("a near-miss paraphrase returns false", () => {
  assert.equal(
    appearsVerbatim("The Contractor gives up all moral rights in the Deliverables.", contract),
    false,
  );
  assert.equal(
    appearsVerbatim("Client shall pay invoices within 90 days of approval.", contract),
    false,
  );
});

test("an empty or whitespace-only quote returns false", () => {
  assert.equal(appearsVerbatim("", contract), false);
  assert.equal(appearsVerbatim(" \n\t ", contract), false);
});

test("locateInOriginal returns the span in the stored text, line breaks included", () => {
  const sentence =
    "All work product, including any pre-existing materials incorporated into the Deliverables, shall be the sole property of the Client upon creation.";
  const span = locateInOriginal(sentence, contract);
  assert.ok(span);
  const original = contract.slice(span.start, span.end);
  assert.ok(original.startsWith("All work product,"));
  assert.ok(original.endsWith("upon\ncreation."));
  assert.equal(original.replace(/\s+/g, " "), sentence);
});

test("locateInOriginal handles irregular spacing and a missing quote", () => {
  const span = locateInOriginal("creation. Contractor waives", contract);
  assert.ok(span);
  assert.equal(contract.slice(span.start, span.end), "creation.   Contractor waives");
  assert.equal(locateInOriginal("The Contractor gives up all moral rights.", contract), null);
  assert.equal(locateInOriginal("  ", contract), null);
});
