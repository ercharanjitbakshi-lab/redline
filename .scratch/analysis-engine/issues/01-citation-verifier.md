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

**Status:** done

- [x] Exact substring match returns true.
- [x] A sentence whose whitespace or line breaks differ from the document's
      (but whose words and punctuation match) returns true.
- [x] A sentence that spans a line break in the source document returns true.
- [x] Differences in punctuation or case return false.
- [x] A near-miss paraphrase (same meaning, different wording) returns false.
- [x] The function has no dependency on the model client, the analyzer, or any
      other module — it is importable and testable entirely on its own.

## Comments

Implemented as `appearsVerbatim(candidate, documentText)` in
`lib/analysis/citation.ts`, tests in `lib/analysis/citation.test.ts`. One
addition beyond the ticket: an empty or whitespace-only candidate returns
false, since an empty string is a substring of every document and would
otherwise pass as a citation. Tests run on Node's built-in runner
(`npm test`) — no test dependency added.
