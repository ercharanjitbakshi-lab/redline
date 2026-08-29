# 0006 — Silent risks and the "Not in this contract" section

Date: 2026-08-29 · Status: Accepted

Amends: ADR 0001 (every flag cites its source sentence).
Relates to: ADR 0003 (target user), ADR 0004 (what gets flagged).

## Decision

Redline v1 reports **silent risks** — dangers that arise from what a contract
does *not* say — in a separate section of the report, working title **"Not in
this contract."**

- The section is driven by a **fixed checklist** of protections a freelancer
  should have: a liability cap, a payment deadline with a late-payment
  consequence, a carve-out for the freelancer's pre-existing IP and general
  tools, a kill fee or payment-for-work-done-on-termination, a defined
  acceptance/approval window, and similar.
- Each item reports present / absent / partially addressed, in the product's
  direct voice (ADR 0005).
- This section makes claims about **absence**. It is therefore **exempt from ADR
  0001's source-sentence rule** — there is no sentence to cite for something that
  isn't there.
- Because its claims have a different evidence basis from flags, it is kept
  **visually and verbally distinct** from the flags section. A reader must never
  be unsure which kind of claim they are looking at.

## Why

- ADR 0001's citation guarantee structurally cannot express the most dangerous
  category of risk for a pre-signing freelancer: the missing liability cap, the
  absent payment deadline, the lack of a pre-existing-IP carve-out. A tool that
  only flags sentences that exist will systematically miss the worst clauses
  precisely because they are absent.
- ADR 0004 already promotes uncapped liability to a first-class risk. Without
  this section, that promotion has nowhere to land — you cannot flag the absence
  of a cap.
- The alternative of stretching a flag to point at a nearby present sentence
  ("Section 8 covers liability but sets no limit") corrupts ADR 0001: the cited
  sentence is not the problem, and the citation stops meaning what it means
  everywhere else.

## Alternatives

- **Silent risks out of scope; v1 analyses only present text and says so.**
  Honest and simple, and it keeps the report single-natured. Rejected: it
  concedes the worst risk category for the product's own target user, and a
  competitor doing gap analysis looks materially smarter.
- **Fold absences into normal flags**, citing a related present sentence.
  Rejected — breaks ADR 0001 as above.
- **One unified risk list, flags and absences mixed, each labelled.** Rejected:
  the trust properties are different enough that mixing them trains users to
  treat cited and uncited claims the same.

## Consequences

- ADR 0001's guarantee is now scoped: **every *flag* cites its source sentence.**
  The "Not in this contract" section is the defined exception, and both the
  product UI and any external description of Redline must be clear that Redline
  makes two kinds of claim with different evidence behind them.
- The freelancer-protection checklist is a maintained artefact, shared with the
  clean-result "what was checked" list (ADR 0005).
- The checklist is opinionated — it encodes a view of what a fair freelance
  contract contains. That view should be written down and be defensible, because
  users will push back on it.
- Test coverage must include: a contract missing each checklist item (absence
  detected), a contract that addresses an item in unusual wording (not a false
  "absent"), and confirmation that nothing in this section is rendered as a
  cited flag.
- Naming: "Not in this contract" is a working title; the PRD picks the final
  label. Whatever it is, it must not read as a second severity tier.
