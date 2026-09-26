# 01: Citation verifier

**What to build:** A pure function that decides whether a candidate source
sentence appears verbatim in the uploaded document's extracted text. This is
the mechanism the citation guarantee (`docs/adr/0001`) rests on: a flag is only
ever as trustworthy as this check.

Given a candidate sentence and the full document text, the function returns
whether the sentence appears in the document after whitespace normalisation —
collapse runs of whitespace (including newlines) to a single space and trim
both ends — compared character-for-character otherwise, including punctuation
and case. No fuzzy matching, no partial-credit near-misses.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Exact substring match returns true.
- [ ] A sentence whose whitespace or line breaks differ from the document's
      (but whose words and punctuation match) returns true.
- [ ] A sentence that spans a line break in the source document returns true.
- [ ] Differences in punctuation or case return false.
- [ ] A near-miss paraphrase (same meaning, different wording) returns false.
- [ ] The function has no dependency on the model client, the analyzer, or any
      other module — it is importable and testable entirely on its own.
