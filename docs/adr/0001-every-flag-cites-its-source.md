# 0001 — Every flag cites its source sentence

Date: 2026-08-28 · Status: Accepted

## Decision

Every risk flag Redline produces cites the exact sentence from the uploaded
document it came from. The source sentence is carried with the flag through the
whole pipeline and shown next to it in the UI. If that sentence cannot be
produced, the flag is not shown. An uncitable flag is a bug, not a degraded
result or a formatting preference.

## Why

What a reader of the output can verify without trusting us:

- Every flag: find the cited sentence in the document and confirm it says what
  the flag claims. The quote is verbatim from the stored text.
- The only failure mode left is a missing flag, which the reader can test by
  reading the document — they never have to wonder if a shown flag is real.
- Counter-offers trace back to the cited clause they answer.
- The question box answers only from the document and points at the text it used.

## Alternatives

- Let the model describe risks in its own words with no quote. Simplest, never
  suppresses a flag — but leaves the user nothing to check. Rejected.
- Cite by paragraph or section number. The user still hunts for the phrase, and
  a wrong pointer is hard to notice. Rejected.
- Show uncitable flags labelled "source unverified". Indistinguishable from the
  thing we are proving we don't do. Rejected.

## Consequences

- The model must return a verbatim span; free-form paraphrase is rejected by the
  pipeline, which string-matches every quote against the stored text.
- Tests must assert citation presence and exact-match, and must cover the
  drop-the-flag path — not just happy-path output.
- Dropping a real risk whose sentence can't be located is an accepted cost.
- OCR stays out: a citation into misread text would break this guarantee.
