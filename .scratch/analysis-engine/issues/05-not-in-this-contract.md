# 05: "Not in this contract" — silent-risk checklist evaluation

**What to build:** The `notInContract` section of the Report: one entry per
protection in the checklist (ticket 02), each marked `present` / `absent` /
`partial` with a note in Redline's own voice. For `absent`, the note says what
is missing and why it matters. This section makes claims about what the
document does *not* say, so — per the defined exception to the citation rule
(`docs/adr/0006`) — its entries never carry a source sentence, even when one
would be available.

**Blocked by:** 02 (clause library & checklist), 04 (analyzer core)

**Status:** ready-for-agent

- [ ] Every checklist protection produces exactly one `notInContract` entry
      with a status and a voiced note.
- [ ] A fixture contract missing a specific protection produces `absent` for
      that entry, with a note naming what's missing and why it matters.
- [ ] A fixture contract that addresses a protection in unusual (non-template)
      wording is not incorrectly reported `absent`.
- [ ] No `notInContract` entry carries a source sentence, regardless of
      whether one exists in the document.
- [ ] `notInContract` entries are visually/structurally distinct in the
      Report shape from `flags` — nothing about the data model invites
      merging the two into one list downstream.
