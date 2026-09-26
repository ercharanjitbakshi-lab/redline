// Contracts used by the analyzer tests. Line breaks fall mid-sentence on
// purpose, the way PDF extraction leaves them.

// One-sided. Annotated with what a competent reviewer would say:
//   2.1  plain work-for-hire of the deliverable      → context only
//   2.2  pre-existing tools pulled into assignment    → severe (ip-pre-existing-work)
//   2.3  vests on creation, before payment            → severe (ip-vests-before-payment)
//   4.1  net 90 after approval                        → high: standard but one-sided
//   6.1  terminate any time, pay nothing              → high
//   7.1  uncapped indemnity for any claim             → severe
//   8.1  12-month non-compete                         → moderate
//   9.1  files delivered on a labelled USB drive      → unusual but harmless, not flagged
//   10.1 mutual confidentiality                       → context only
export const oneSidedContract = `FREELANCE SERVICES AGREEMENT

1. Services. Contractor will design a brand identity for Client as set out in
Schedule A.

2. Ownership.
2.1 Client will own the final logo and brand guidelines delivered under this
Agreement.
2.2 All Work Product, together with any pre-existing tools, materials, and
methods of Contractor incorporated therein, shall be the sole property of
Client.
2.3 All right, title, and interest in the Work Product shall vest in Client
immediately upon creation.

3. Schedule. Contractor will deliver first concepts within 15 business days.

4. Payment.
4.1 Client shall pay each invoice within ninety (90) days of Client's approval
of the related deliverables.

5. Revisions. The fee includes two rounds of revisions.

6. Termination.
6.1 Client may terminate this Agreement at any time for any reason, and no
further payment shall be due to Contractor.

7. Indemnity.
7.1 Contractor shall indemnify and hold harmless Client against any and all
claims, losses, and expenses arising from or related to the Work Product.

8. Non-Competition.
8.1 For twelve (12) months after this Agreement ends, Contractor shall not
provide design services to any business in Client's industry.

9. Delivery Format.
9.1 Contractor shall deliver final files on a USB drive labelled with the
project name and date.

10. Confidentiality.
10.1 Each party shall keep the other party's non-public information
confidential for two (2) years after this Agreement ends.
`;

// Fair. A competent reviewer would flag nothing: assignment on payment with a
// carve-out, net 15 with late interest, a deemed-acceptance window, a kill
// fee, and a mutual liability cap.
export const fairContract = `FREELANCE SERVICES AGREEMENT

1. Services. Contractor will write six blog posts for Client as set out in
Schedule A.

2. Ownership. Ownership of each final post passes to Client when Client has
paid for it in full. Contractor keeps all tools, templates, and know-how that
existed before this Agreement or were not made specifically for Client.

3. Payment. Client shall pay each invoice within fifteen (15) days. Unpaid
amounts accrue interest at 1% per month.

4. Acceptance. Client has five (5) business days after delivery to request
changes; after that, the post is accepted.

5. Termination. Either party may end this Agreement with ten (10) days' written
notice. Client shall pay for all work done up to the end date plus a kill fee
of 25% of the remaining fees.

6. Liability. Each party's total liability under this Agreement is limited to
the fees paid under it, and neither party is liable for indirect losses.
`;
