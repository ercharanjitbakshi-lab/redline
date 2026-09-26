# 02: Clause library and protection checklist (data)

**What to build:** The two read-only data artefacts the analyzer's judgment
rests on, structured so a non-technical reviewer can read and argue with them
(PRD §5, `docs/adr/0004`, `docs/adr/0006`):

1. **The clause library** — the clause categories Redline recognises, each
   with its default severity (`severe` / `high` / `moderate` / context-only)
   and the asymmetry-test rationale for why it sits at that severity:
   - Severe: IP-assignment sharp edges (pre-existing IP or general tools,
     assignment vesting before payment, moral-rights/portfolio grabs);
     uncapped liability and broad indemnification.
   - High: termination-for-convenience with no payment for work done;
     payment terms that delay or gate payment (approval-gated, net-60/90,
     late-invoked kill fees).
   - Moderate: non-compete / exclusivity / non-solicit; unilateral amendment.
   - Context-only (not flagged): standard work-for-hire assignment of the
     commissioned deliverable, ordinary confidentiality, a limitation that is
     actually mutual.
2. **The protection checklist** — the fixed list of protections a freelance
   contract should have, used by the "Not in this contract" section: a
   liability cap, a payment deadline with a late-payment consequence, a
   carve-out for the freelancer's pre-existing IP and general tools, a kill
   fee or payment for work done on termination, a defined acceptance/approval
   window.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Every clause category has a severity (or is marked context-only) and a
      written asymmetry-test rationale — not just a label.
- [x] The plain work-for-hire assignment of the commissioned deliverable is
      represented as context-only, distinct from the IP-assignment sharp
      edges that are severe.
- [x] Every checklist protection has a key and a short description of what it
      protects against.
- [x] Both artefacts are data (no analyzer logic), importable by later
      tickets, and readable/reviewable on their own without running any code.

## Comments

Implemented as `lib/analysis/clause-library.ts` and
`lib/analysis/protection-checklist.ts`, typed TS data with a reading guide at
the top of each file. Invariant tests in `lib/analysis/data.test.ts`.

Choices worth reviewing:
- The IP sharp edges are three separate severe categories
  (`ip-pre-existing-work`, `ip-vests-before-payment`,
  `ip-moral-or-portfolio-rights`) rather than one, so each gets its own
  fixture and explanation. Uncapped liability and broad indemnity are also
  split.
- Non-compete / exclusivity / non-solicit stay one category, as in PRD §5.
- Each category has a `notWhen` boundary (the fair version of the clause),
  and each protection has `presentWhen` / `partialWhen`, for the analyzer
  and ticket 05's present/absent/partial call.
- The copy went through the humanizer, since names show up in the clean
  result's list of checks.
