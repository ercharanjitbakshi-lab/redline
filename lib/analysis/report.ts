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

// One entry per protection on the checklist (docs/adr/0006). A claim about
// what the contract does not say, so it has no source sentence, and a
// different shape from Flag on purpose: nothing here can be merged into the
// flags list downstream.
export type ProtectionStatus = "present" | "absent" | "partial";

export type ProtectionEntry = {
  key: string;
  name: string;
  status: ProtectionStatus;
  // Redline's own voice. For absent: what is missing and why it matters.
  note: string;
};

export type Check = { kind: "clause" | "protection"; key: string; name: string };

export type Report = {
  summary: string;
  // Most severe first.
  flags: Flag[];
  contextNotes: ContextNote[];
  // "Not in this contract": kept apart from flags (docs/adr/0006).
  notInContract: ProtectionEntry[];
  // True exactly when flags is empty.
  clean: boolean;
  // Every check run, whatever the outcome, so a clean result shows its work.
  checksRun: Check[];
  // Proposed flags removed before the report: the quote was not verbatim in
  // the document, or the category was not one Redline recognises. For
  // observability; not shown to the user.
  droppedFlagCount: number;
};
