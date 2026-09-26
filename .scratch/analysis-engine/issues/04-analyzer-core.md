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

**Status:** ready-for-agent

- [ ] Given a fixture contract and a fake model response, `analyze()` returns
      a summary, and flags ordered most-severe-first, each carrying its
      source sentence, severity, category, and explanation.
- [ ] A flag whose proposed source sentence fails the citation verifier is
      absent from the Report, and `droppedFlagCount` reflects the drop.
- [ ] A standard-but-one-sided clause is still flagged — being common is not
      a defence — and an unusual-but-harmless clause is not flagged.
- [ ] A plain work-for-hire assignment of the deliverable appears in
      `contextNotes`, not `flags`.
- [ ] A contract a competent reviewer judged fair produces `clean: true`, an
      empty `flags` list, and a populated `checksRun` — never an invented
      flag to avoid a bare result.
- [ ] The same fixture and fixed model output, run five times, produce an
      identical Report.
- [ ] Tests assert only on the returned `Report` — not on prompt strings,
      call counts, or internal clause-matching structures.
