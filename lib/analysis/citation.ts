// The citation guarantee (docs/adr/0001) rests on this check: a flag is shown
// only if its source sentence appears verbatim in the document's stored text.
// Whitespace is the one thing allowed to differ, because PDF and DOCX
// extraction break lines and pad spaces unpredictably. Everything else —
// words, punctuation, case — must match exactly. No fuzzy matching.

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Where the candidate starts in the whitespace-normalised document, or -1 if
// it does not appear verbatim.
export function locateVerbatim(candidate: string, documentText: string): number {
  const sentence = normalizeWhitespace(candidate);
  // An empty quote would match every document; it cites nothing.
  if (sentence === "") return -1;
  return normalizeWhitespace(documentText).indexOf(sentence);
}

export function appearsVerbatim(candidate: string, documentText: string): boolean {
  return locateVerbatim(candidate, documentText) !== -1;
}

// Where the candidate sits in the original, un-normalised document text, as
// [start, end) character offsets, or null if it does not appear verbatim.
// Used to highlight a flag's source sentence in the contract as stored.
export function locateInOriginal(
  candidate: string,
  documentText: string,
): { start: number; end: number } | null {
  const sentence = normalizeWhitespace(candidate);
  if (sentence === "") return null;

  // Build the normalised text again, remembering where each character came from.
  let normalized = "";
  const origin: number[] = [];
  let pendingSpace = false;
  for (let i = 0; i < documentText.length; i++) {
    if (/\s/.test(documentText[i])) {
      pendingSpace = normalized.length > 0;
      continue;
    }
    if (pendingSpace) {
      normalized += " ";
      origin.push(i - 1);
      pendingSpace = false;
    }
    normalized += documentText[i];
    origin.push(i);
  }

  const at = normalized.indexOf(sentence);
  if (at === -1) return null;
  return { start: origin[at], end: origin[at + sentence.length - 1] + 1 };
}
