# 04: Analyzer core — summary, cited & ranked flags, context notes, clean result

**What to build:** The primary seam: `analyze({ documentText, redLines })`,
async, returning a `Report`. This ticket delivers the base Report — everything
except the "Not in this contract" section, red-line handling, and voice
enforcement, which extend it in later tickets.

Given the model's proposed flags, verify each one's source sentence against
`documentText` using the citation verifier (ticket 01); drop any flag that
fails verification entirely (no "unverified" state) and count the drops in
`droppedFlagCount`. Assign each surviving flag a severity and category from
the clause library (ticket 02) and order flags most-severe-first. Clauses
recognised as context-only (e.g. plain work-for-hire assignment) are surfaced
as `contextNotes`, not flags. `clean` is true exactly when `flags` is empty,
and `checksRun` always lists the checks performed regardless of outcome, so a
clean result shows its work rather than reading as an empty screen.

The analyzer must be deterministic given fixed model output: no dependency on
wall-clock, map/object iteration order, or randomness in ordering,
de-duplication, or severity assignment.

**Blocked by:** 01 (citation verifier), 02 (clause library & checklist), 03
(model client)

**Status:** done

- [x] Given a fixture contract and a fake model response, `analyze()` returns
      a summary, and flags ordered most-severe-first, each carrying its
      source sentence, severity, category, and explanation.
- [x] A flag whose proposed source sentence fails the citation verifier is
      absent from the Report, and `droppedFlagCount` reflects the drop.
- [x] A standard-but-one-sided clause is still flagged — being common is not
      a defence — and an unusual-but-harmless clause is not flagged.
- [x] A plain work-for-hire assignment of the deliverable appears in
      `contextNotes`, not `flags`.
- [x] A contract a competent reviewer judged fair produces `clean: true`, an
      empty `flags` list, and a populated `checksRun` — never an invented
      flag to avoid a bare result.
- [x] The same fixture and fixed model output, run five times, produce an
      identical Report.
- [x] Tests assert only on the returned `Report` — not on prompt strings,
      call counts, or internal clause-matching structures.

## Comments

Implemented as `analyze(input, { model })` in `lib/analysis/analyze.ts`, with
the Report types in `report.ts`, the model instructions in `prompt.ts`, and
annotated fixtures in `fixtures.ts`. 18 tests in `analyze.test.ts` against the
fake model; `analyze.live.ts` runs the same fixtures against the real pinned
model (`npm run test:live`).

How it works: the model proposes `{ summary, findings: [{ category,
sourceSentence, explanation }] }` as JSON. Code does the rest: citation check,
severity from the clause library (a severity the model sends is ignored),
flags vs context notes, de-duplication, and ordering (severity, then position
in the document, then clause-library order).

Decisions to review:
- `droppedFlagCount` also counts proposals with a category Redline does not
  recognise, not only failed quotes. Both are flags the user never sees.
- Context notes are citation-checked too; a failed one is left out but not
  counted (it was never a flag).
- Unreadable model output throws. It never becomes an empty, clean Report.
- `checksRun` lists the nine flaggable categories for now; ticket 05 adds the
  protection checklist.
- `redLines` is accepted and ignored; `hitsRedLine` is always null until 06.

Live run, 2026-09-26, Claude Sonnet 5: the one-sided fixture produced exactly
the six annotated flags at the annotated severities (net-90 flagged as
standard-but-one-sided, USB delivery clause not flagged), work-for-hire and
confidentiality as context notes, 0 dropped. The fair fixture came back clean.
Explanations address the freelancer as "you" per ADR 0005.
