# Redline Research — Agent 1: Real people hurt by contract terms they didn't understand or notice

Scope: Public forum / community accounts (Hacker News, legal-advice and consumer forums, wedding forums, Twitter/X) of individuals harmed — or nearly harmed — by contract, lease, ToS, or freelance-agreement clauses they missed or misread. Verbatim quotes + exact source URLs.

Important accuracy note: Reddit (all subdomains), old.reddit.com, WeddingWire, GetRichSlowly, and several forum pages were not fetchable from this environment (blocked / 403 / rate-limited). Hacker News item pages rate-limited (HTTP 429) partway through. Quotes below are the excerpts returned by page-text extraction of the cited URLs; each carries its source URL so the exact wording can be verified in context. Where I could not confirm wording I say so.

---

## Findings

### 1. Employment contract: post-employment IP assignment + illegal terms, buried in 15 pages
> "Employee fully and unconditionally grants, assigns and transfers to the Company any and all Inventions created ... for a period of one (1) year thereafter"

> "15 pages long ... they required 30-days notice before leaving, which in PA is illegal"

- Source URL: https://news.ycombinator.com/item?id=9729916
- Community / context: Hacker News thread "Ask HN"-style discussion on employment contracts (comment by user `moron4hire`). Describes a friend handed a ~15-page offer contract containing an invention-assignment clause reaching one year past termination, an illegal unpaid-overtime requirement, and an illegal 30-day notice term. After the friend said he had consulted a lawyer, "the company cut a settlement check to make the candidate disappear."
- Clause type: IP / invention assignment (over-broad, extends past employment); illegal notice period; unpaid overtime.

### 2. Employment contract: signed under financial pressure, still doesn't know what it restricts
> "I almost didn't sign but I also couldn't afford to go without a job. Two years later I'm trying to figure out exactly what I signed because I believe it was very limiting."

- Source URL: https://news.ycombinator.com/item?id=9729916
- Community / context: Same Hacker News thread (comment by user `johnward`). He adds that when he later asked HR for a copy, they could not produce his original signed contract.
- Clause type: Unknown restrictive covenant(s) — likely non-compete / IP assignment; signer never understood scope.

### 3. Employment contract: "unlimited right to audit" personal devices
> "unlimited right to audit" personal devices if any work communication occurred on them

- Source URL: https://news.ycombinator.com/item?id=9729916
- Community / context: Same Hacker News thread (comment by user `chrsstrm`). Flagged a clause that, if any work communication ever touched a personal device, gave the employer an unlimited right to audit that device — effectively access to all personal data on it.
- Clause type: Company audit / inspection rights over employee personal property.

### 4. Post-acquisition employment contract: "very expensive downsides"
> "significant and potentially very expensive downsides"

- Source URL: https://news.ycombinator.com/item?id=9729916
- Community / context: Same Hacker News thread (comment by user `DennisP`). After an acquisition, staff were asked to sign new contracts with terms enforceable in his state; he refused, was asked for a resignation letter effective three months later.
- Clause type: Restrictive covenants introduced via change-of-control re-papering.

### 5. Adobe Creative Cloud: "unintended annual renewal" with early-cancel penalty
> "Adobe got me with an unintended annual renewal ... no way to turn off autorenewal until the 12th month without losing access immediately and paying a penalty."

- Source URL: https://news.ycombinator.com/item?id=20464973 (comment surfaced via HN Algolia; the item page itself returned HTTP 429 on retry, so username/full context not re-confirmed)
- Community / context: Hacker News comment about Adobe's "annual plan, paid monthly" subscription. The commenter did not realize they were on a 12-month commitment; the early-termination fee (roughly 50% of the remaining term) applied.
- Clause type: Auto-renewal / minimum-term commitment / early-termination fee in a SaaS subscription.

### 6. "Locked in for 2 years with autorenewal and 3–6 months' notice to quit — for everything"
> "contracts (where you're usually locked in for 2 years with autorenewal and requiring 3 or 6 months' notice to quit) for literally everything"

- Source URL: https://news.ycombinator.com/item?id=19412995 (comment surfaced via HN Algolia)
- Community / context: Hacker News comment (describing consumer contracts, gym / telecom / utility style) where the combination of a 2-year term, silent auto-renewal, and a long advance-notice cancellation window routinely traps people.
- Clause type: Auto-renewal + long notice-to-cancel window.

### 7. Home warranty contract: buried mandatory-arbitration + pre-authorization clauses
> "Sending HWC an invoice and getting reimbursed is actually an allowed part of my contract under certain circumstances. One of those circumstances, though, is obtaining a pre-authorization from HWC."

> "I also pointed out there was no out-clause in the contract for computer system failures."

> "My contract required arbitration from the American Arbitration Association"

- Source URL: https://www.shuchow.com/so-i-took-a-huge-corporation-to-arbitration/
- Community / context: Personal blog post. A homeowner's warranty claim was denied because the company's systems were down and could not issue the required pre-authorization; the contract also forced him into AAA arbitration instead of court. Note: this is framed as a "read your contract and I won" story ("READ. YOUR. CONTRACT."), not a pure victim account — but it illustrates how pre-auth and forced-arbitration clauses are missed until a dispute arises.
- Clause type: Mandatory arbitration; pre-authorization / claims-procedure conditions.

### 8. Lease deposit: charged full carpet replacement over two stains
> "the landlord is putting in a claim for my security deposit because he says he will need to replace all of the carpet"

> "I agree to the damages but not the repair cost."

- Source URL: https://www.city-data.com/forum/renting/2575085-landlord-keeping-security-deposit-replace-carpet.html
- Community / context: City-Data "Renting" forum. A departing tenant with a soda stain in the living room and a bleach spot in one bedroom had the landlord claim the entire $995 security deposit to replace all carpet in the unit, relying on the lease's damage/replacement language rather than pro-rating for depreciation or replacing only the affected rooms.
- Clause type: Security-deposit deduction / carpet-replacement / damage clause (no depreciation or pro-ration).

---

## Additional lower-confidence leads (URL captured, wording not fully verified)

- Startup founder, Ask HN: "the contracts that were offered to me had ridiculous clauses that were heavily in their favor" — re: equity/IP terms. Surfaced via HN Algolia; specific item URL not pinned down. Not counted as a finding.
- Twitter/X dark-patterns account: "Adobe tricks users into a 12 month contract" — https://twitter.com/darkpatterns/status/1489901640777973768 (commentary, not a first-person harm account).
- Get Rich Slowly reader-story comments reportedly include a gym contract "requiring 45 days to cancel" and later surprise charges after a move — https://www.getrichslowly.org/reader-story-learning-to-read-the-fine-print/ (page returned HTTP 403; could not verify quote).

## What I could not find / gaps

- No Reddit content: r/legaladvice, r/Landlord, r/personalfinance, r/smallbusiness, r/freelance, r/juststart etc. are all blocked from this environment and did not surface as clickable results via web search. Reddit is likely the single richest vein for this and remains unmined.
- No Twitter/X first-person threads captured (only one third-party commentary link).
- Freelancer-specific harm (kill fees, unlimited revisions, net-60/90 payment terms, work-for-hire / IP transfer, indemnification) — searched but found no sourced first-person account. Known to be widely discussed on Reddit r/freelance and freelancer Twitter, but not retrievable here.
- Consumer ToS harm (account termination, class-action waiver, unilateral price changes, content/IP license grabs) — no sourced first-person account obtained.
- Wedding / event vendor contracts (non-refundable retainer, "full contract value on cancellation") — WeddingWire forum threads identified by search but pages returned HTTP 403; no verbatim quote captured.
- Car lease / auto finance (mileage overage, disposition fee, wear-and-tear, GAP) — not covered.
- Gym membership auto-renewal — regulatory/news coverage found (FTC vs LA Fitness, NYC "subscription trap"), but no individual forum account with a verbatim quote.
- Several HN item pages could not be opened for full context due to HTTP 429 rate limiting, so usernames and surrounding context for findings 5 and 6 are partially unconfirmed.

## Search budget used

Web searches: 12 of 12 (cap reached). Pages read / fetch attempts: 15 of 15 (cap reached) — of which ~6 returned usable content; the rest were blocked (Reddit x3), 403 (GetRichSlowly, WeddingWire), 429 (Hacker News item pages x2), or returned no usable first-person quote (City-Data thread was usable; several HN Algolia queries returned no matches).
