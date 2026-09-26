// Reads a contract's text in the browser. The file itself never leaves the
// user's machine; only the text this returns is sent to the server
// (CLAUDE.md, "Stack"). There is no OCR: a citation into misread text would
// break the citation guarantee (docs/adr/0001), so a scan is refused.

import { MAX_TEXT_LENGTH } from "./limits";

// Fewer letters than this and there is no real text layer to cite from.
const MIN_LETTERS = 100;

export class ExtractionError extends Error {}

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  let text: string;

  if (name.endsWith(".pdf")) text = await readPdf(file);
  else if (name.endsWith(".docx")) text = await readDocx(file);
  else if (name.endsWith(".doc")) {
    throw new ExtractionError(
      "Redline can't read old .doc files. Open it in Word, save it as .docx, and upload that.",
    );
  } else {
    throw new ExtractionError("Redline reads PDF and Word (.docx) files.");
  }

  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  if (letters < MIN_LETTERS) {
    throw new ExtractionError(
      "Redline can't find any text in this file. If it's a scanned document, upload the original PDF or a Word version instead.",
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new ExtractionError("This document is too long for Redline. The limit is about 100 pages.");
  }
  return text;
}

async function readPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  let pdf;
  try {
    pdf = await task.promise;
  } catch (error) {
    if (error instanceof pdfjs.PasswordException) {
      throw new ExtractionError("This PDF is password-protected. Remove the password and upload it again.");
    }
    throw new ExtractionError("Redline couldn't open this PDF. Check that the file isn't damaged.");
  }

  // Keep the PDF's own line and page breaks. The citation check ignores
  // whitespace differences, so this only has to keep words apart.
  const pages: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const content = await (await pdf.getPage(n)).getTextContent();
    let page = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      page += item.str + (item.hasEOL ? "\n" : "");
    }
    pages.push(page);
  }
  // Frees the worker.
  await task.destroy();
  return pages.join("\n\n");
}

async function readDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  try {
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return value;
  } catch {
    throw new ExtractionError("Redline couldn't open this Word file. Check that it's a .docx and isn't damaged.");
  }
}
