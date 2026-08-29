# 0003 — The target user is the freelancer who negotiates

Date: 2026-08-29 · Status: Accepted

## Decision

Redline v1 is built for one user: the independent contractor or freelancer
reviewing an agreement **before signing it**, who **will push back** on terms.
The design centre is their workflow (recurring, mostly short contracts), their
document types (services agreements, statements of work, IP and brand-deal
contracts), and their leverage — they can still change the deal.

The brief names one segment v1 **does not serve**: consumers reviewing SaaS terms
of service and subscription auto-renewal terms.

Renters, already-signed users, and small businesses are not the target and the
product is not tuned for them. A freelancer's own apartment lease will be
analysed if pasted, but the analysis is not tuned for leases and the product says
so.

## Why

- The counter-offer capability (capability 3) only has value if the user can act
  on it. That requires the pre-signing moment and a user with leverage. Designing
  for the already-signed user, or for a consumer stuck with un-negotiable terms,
  would make the product's central feature decorative.
- The research (`research/summary.md` §4) puts freelancers among the two segments
  in sharpest, best-evidenced pain, with varied document types that also test the
  "works on non-standard documents" wedge (§3.2).
- ToS / subscription terms are the single best-evidenced pain in the research
  (§2 ranks auto-renewal and forced arbitration #1–2). We are giving that up on
  purpose: there is no counter-offer path, the red-lines and question-box
  capabilities add little, and the user's situation is "stuck," not
  "negotiating." Serving it would blunt the freelancer build.

## Alternatives

- **Serve renters as the primary user.** Strong pain evidence (only 7% get a
  lawyer), but a cluster of near-identical lease tools already ships severity
  flags, citations, and negotiation letters (§3.2), and lease review is a
  once-a-year event with little repeat use.
- **Serve small business owners.** Higher willingness to pay and repeat
  commercial documents, but "small business" spans a solo consultant to a
  40-person firm — not one workflow to design around.
- **Serve the already-signed user** ("two years later I'm trying to figure out
  what I signed", §1). Higher intent and a clearer trigger (a demand letter, a
  dispute), but no negotiation moment for the product to affect, and the
  counter-offer feature becomes pointless.
- **Serve everyone who might paste a document.** The path of least resistance,
  and the reason most consumer tools are shallow. Rejected — see ADR 0004 and
  0005, which depend on knowing who the user is.

## Consequences

- `CLAUDE.md` no longer pitches "contract, lease, freelance agreement, or ToS."
  The one-line description and the capability/exclusion lists change to match
  this ADR. (Proposed as a diff, not applied unilaterally.)
- The accepted sacrifice: the target is "the freelancer who negotiates," which is
  a fraction of the freelancer pain population — the research notes fewer than 1%
  of stiffed freelancers ever use the legal system. If that slice is too small,
  the product thesis is wrong, and this is the first thing customer conversations
  should test.
- Severity, voice, and clause selection (ADR 0004, 0005) are all tuned to this
  user and would need to be revisited for any other segment.
- Lease handling is explicitly second-class: analysed, labelled as not tuned, not
  a design constraint.
