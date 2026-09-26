import { test } from "node:test";
import assert from "node:assert/strict";
import { appearsVerbatim } from "./citation.ts";

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
