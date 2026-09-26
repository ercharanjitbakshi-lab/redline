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

**Status:** ready-for-agent

- [ ] Every clause category has a severity (or is marked context-only) and a
      written asymmetry-test rationale — not just a label.
- [ ] The plain work-for-hire assignment of the commissioned deliverable is
      represented as context-only, distinct from the IP-assignment sharp
      edges that are severe.
- [ ] Every checklist protection has a key and a short description of what it
      protects against.
- [ ] Both artefacts are data (no analyzer logic), importable by later
      tickets, and readable/reviewable on their own without running any code.
