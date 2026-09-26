# 05: "Not in this contract" — silent-risk checklist evaluation

**What to build:** The `notInContract` section of the Report: one entry per
protection in the checklist (ticket 02), each marked `present` / `absent` /
`partial` with a note in Redline's own voice. For `absent`, the note says what
is missing and why it matters. This section makes claims about what the
document does *not* say, so — per the defined exception to the citation rule
(`docs/adr/0006`) — its entries never carry a source sentence, even when one
would be available.

**Blocked by:** 02 (clause library & checklist), 04 (analyzer core)

**Status:** done

- [x] Every checklist protection produces exactly one `notInContract` entry
      with a status and a voiced note.
- [x] A fixture contract missing a specific protection produces `absent` for
      that entry, with a note naming what's missing and why it matters.
- [x] A fixture contract that addresses a protection in unusual (non-template)
      wording is not incorrectly reported `absent`.
- [x] No `notInContract` entry carries a source sentence, regardless of
      whether one exists in the document.
- [x] `notInContract` entries are visually/structurally distinct in the
      Report shape from `flags` — nothing about the data model invites
      merging the two into one list downstream.

## Comments

The same model call that proposes flags now also answers each protection
(`protections: [{ key, status, note }]`). `analyze()` builds `notInContract`
fresh from the checklist, in checklist order, as `{ key, name, status, note }`
(type `ProtectionEntry` in `report.ts`). No source sentence, severity or
category field exists on it, so nothing the model sends can attach a quote,
and it cannot be merged into `flags` by shape. `checksRun` entries now carry
`kind: "clause" | "protection"` and list all five protections.

Decisions to review:
- A protection the model leaves unanswered (or answers with an unknown status
  or empty note) fails the whole analysis. Defaulting it to `absent` would be
  a claim nobody made. A retry on unreadable output is a candidate for later.
- A missing protection does not affect `clean`, which stays "no flags" per
  the spec. The UI will need to show both, so a clean result with absent
  protections does not read as "nothing to worry about".

Tests: 9 in `not-in-contract.test.ts`; new fixture `unusualWordingContract`.
Live run 2026-09-26 (Sonnet 5): one-sided fixture → four absent and
payment-deadline partial; fair → all present; unusual wording → all present.
Two live notes used "could" despite the prompt; ticket 07 enforces that.
