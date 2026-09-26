import type { FlagSeverity } from "./clause-library.ts";

// What the analysis engine returns. See .scratch/analysis-engine/spec.md,
// "The Report contract".

export type RedLine = { id: string; text: string };

export type Flag = {
  // Verbatim from the document, whitespace collapsed (docs/adr/0001).
  sourceSentence: string;
  severity: FlagSeverity;
  // A clause-library key.
  category: string;
  // Redline's own judgment, in its own voice (docs/adr/0004, 0005).
  explanation: string;
  // The id of the user's red line this clause hits, or null.
  hitsRedLine: string | null;
};

export type ContextNote = {
  sourceSentence: string;
  category: string;
  note: string;
};

export type Check = { key: string; name: string };

export type Report = {
  summary: string;
  // Most severe first.
  flags: Flag[];
  contextNotes: ContextNote[];
  // True exactly when flags is empty.
  clean: boolean;
  // Every check run, whatever the outcome, so a clean result shows its work.
  checksRun: Check[];
  // Proposed flags removed before the report: the quote was not verbatim in
  // the document, or the category was not one Redline recognises. For
  // observability; not shown to the user.
  droppedFlagCount: number;
};
