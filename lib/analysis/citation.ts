// The citation guarantee (docs/adr/0001) rests on this check: a flag is shown
// only if its source sentence appears verbatim in the document's stored text.
// Whitespace is the one thing allowed to differ, because PDF and DOCX
// extraction break lines and pad spaces unpredictably. Everything else —
// words, punctuation, case — must match exactly. No fuzzy matching.

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function appearsVerbatim(candidate: string, documentText: string): boolean {
  const sentence = normalizeWhitespace(candidate);
  // An empty quote would match every document; it cites nothing.
  if (sentence === "") return false;
  return normalizeWhitespace(documentText).includes(sentence);
}
