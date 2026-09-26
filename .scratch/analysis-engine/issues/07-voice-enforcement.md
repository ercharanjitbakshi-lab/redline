# 07: Voice enforcement — hedge-word scan across all engine prose

**What to build:** A final pass over the assembled Report, before it is
returned, that scans every string the engine itself wrote — the summary, each
flag's explanation, each `notInContract` note — for hedge words ("may",
"might", "could be seen as", "potentially", "arguably", and equivalents),
with the verbatim quoted source-sentence spans excluded from the scan (quoted
document text is not the engine's own voice and is not held to this rule). A
hedge word found in the engine's own prose is treated as a failure to correct
before the Report returns — not a warning, not a passthrough
(`docs/adr/0005`).

This ticket also implements the flat "prefer the false flag" bias at the
point it's actually exercised: given a citable sentence and a marginal call,
the analyzer flags rather than stays silent.

**Blocked by:** 04 (analyzer core), 05 ("Not in this contract" section) — the
scan has to cover `notInContract` notes as well as flags and the summary,
so it waits on both prose surfaces existing.

**Status:** done

- [x] A fake model response containing a hedge word in a flag explanation is
      corrected before the Report is returned; the returned Report contains
      no hedge words outside quoted source-sentence spans.
- [x] The scan excludes quoted source-sentence text — a hedge word that
      happens to appear inside the document's own wording does not trigger
      a correction.
- [x] The scan covers the summary and every `notInContract` note, not only
      flag explanations.
- [x] Given a marginal, citable case, the analyzer's documented bias is to
      flag rather than stay silent, and a test exercises this directly.

## Comments

Implemented in `lib/analysis/voice.ts`; `analyze()` calls `enforceVoice()` as
its last step. Tests in `voice.test.ts` (10); live checks now assert every
report is hedge-free.

- Scanned: summary, flag explanations, context notes, `notInContract` notes.
  Flags' `sourceSentence` is never scanned, and a quoted span inside prose is
  skipped when it is verbatim contract text (a made-up quote is still
  scanned).
- Hedge list (one source, also used in the prompts): may, might, could,
  possibly, potentially, arguably, perhaps, probably, (un)likely, seem(s),
  appear(s) to, conceivably, presumably. Not hedges: "May" next to a number
  (the month), "couldn't".
- Correction: only the offending strings go back to the model for a rewrite
  (statement, or a direct question where unsure), up to two rounds, re-scanned
  each time. A hedge that survives fails the analysis. No mechanical word
  swaps: "may" → "can" changes meaning.
- Prefer-the-false-flag: there is no confidence gate; a citable finding in a
  flaggable category is always a flag, whatever confidence the model attaches
  (tested). The prompt tells the model to flag close calls. Live: net 45 in
  an otherwise fair contract (`marginalContract`) is flagged.

Live run 2026-09-26 (Sonnet 5): all six live checks pass with no hedge words
in any report.
