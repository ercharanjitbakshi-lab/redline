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

**Status:** ready-for-agent

- [ ] A clause matching a supplied red line sets `hitsRedLine` to that red
      line's id on the corresponding flag.
- [ ] A red-line hit's severity is floored at `high` even if the built-in
      clause-library severity for that category is lower.
- [ ] A red-line hit is always present in `flags` — never dropped for being
      low-severity.
- [ ] An empty `redLines` list produces the same Report as before this
      ticket, with every flag's `hitsRedLine` null.
- [ ] A clause that does not match any supplied red line leaves `hitsRedLine`
      null and its severity unaffected.
