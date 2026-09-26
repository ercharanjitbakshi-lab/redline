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

**Status:** ready-for-agent

- [ ] A fake model response containing a hedge word in a flag explanation is
      corrected before the Report is returned; the returned Report contains
      no hedge words outside quoted source-sentence spans.
- [ ] The scan excludes quoted source-sentence text — a hedge word that
      happens to appear inside the document's own wording does not trigger
      a correction.
- [ ] The scan covers the summary and every `notInContract` note, not only
      flag explanations.
- [ ] Given a marginal, citable case, the analyzer's documented bias is to
      flag rather than stay silent, and a test exercises this directly.
