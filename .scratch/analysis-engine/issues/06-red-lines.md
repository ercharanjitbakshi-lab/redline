# 06: Red lines — user-supplied checks and severity floor

**What to build:** Checking the user's own `redLines` (`{ id, text }` list)
against the document in addition to the built-in clause library. When a
clause matches a red line, that clause's flag carries the red line's id in
`hitsRedLine`, and its severity is raised to at least `high` if the built-in
severity would otherwise have been lower — a red-line hit is never buried
below the fold, and is never dropped from `flags` for being low-severity. An
empty `redLines` list is normal and changes nothing except that no flag sets
`hitsRedLine`.

**Blocked by:** 04 (analyzer core)

**Status:** done

- [x] A clause matching a supplied red line sets `hitsRedLine` to that red
      line's id on the corresponding flag.
- [x] A red-line hit's severity is floored at `high` even if the built-in
      clause-library severity for that category is lower.
- [x] A red-line hit is always present in `flags` — never dropped for being
      low-severity.
- [x] An empty `redLines` list produces the same Report as before this
      ticket, with every flag's `hitsRedLine` null.
- [x] A clause that does not match any supplied red line leaves `hitsRedLine`
      null and its severity unaffected.

## Comments

The user's red lines go into the prompt; each finding carries `redLineId`
(or null). The analyzer only trusts ids the user actually supplied, and a
red-line hit still has to pass the citation check like any flag.

Decisions to review:
- A red-line hit that fits no built-in category is flagged under the
  category `"red-line"` at `high` (documented on `Flag.category` in
  `report.ts`). Without it, a clause that breaks the user's rule but passes
  the asymmetry test would have nowhere to go.
- A red-line hit on a context-only category (e.g. plain work-for-hire) becomes
  a `high` flag, not a context note: "never dropped" includes never being
  demoted to context.
- Floor: moderate and context-only become `high`; `severe` stays `severe`.
- `hitsRedLine` holds one id. A clause breaking two red lines keeps the first
  the model reports (per category).
- Each red line is listed in `checksRun` as `kind: "red-line"`.

Tests: 11 in `red-lines.test.ts`. Live run 2026-09-26 (Sonnet 5), red lines
in plain words: "I don't sign non-competes" → the non-compete, raised
moderate→high; "Final files are delivered digitally, never on physical
media" → the USB clause as a `red-line` flag at high; "No automatic
renewal" → no hit (correct: none in the contract).
