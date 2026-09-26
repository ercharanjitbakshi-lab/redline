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

// Every protection on the checklist is here, but none in template wording.
// A reviewer would mark all five present:
//   liability cap          → "aggregate exposure ... shall not exceed the sums ... remitted"
//   payment deadline       → "settle ... inside a fortnight", then a 1.5% monthly surcharge
//   pre-existing IP        → "Studio Kit" stays with Studio, Client gets a licence
//   payment on termination → "calling a halt" pays for everything done, plus a third
//   acceptance window      → "silence for seven days" is sign-off
export const unusualWordingContract = `STUDIO ENGAGEMENT LETTER

A. What we'll make. Studio will produce an animated explainer for Client, as
described in the attached brief.

B. Studio Kit. Anything Studio brought to this job or uses across its work,
including rigs, brushes, scripts, and character templates (the "Studio Kit"),
remains Studio's. Client receives a permanent licence to use the Studio Kit as
it appears inside the finished explainer, and for nothing else.

C. Settling up. Client will settle each bill inside a fortnight of receiving
it. Anything left unsettled after that attracts a surcharge of 1.5% for each
month it stays open, and Studio may down tools until it is settled.

D. Sign-off. Client reviews each cut and replies with notes or sign-off.
Silence for seven days after a cut is delivered counts as sign-off.

E. Calling a halt. Either side can call a halt to the project in writing. If
Client calls a halt, Client pays for everything done up to that day and one
third of the fees for the work not yet started.

F. How far Studio's exposure goes. However a claim arises, Studio's aggregate
exposure under this letter shall not exceed the sums Client has actually
remitted to Studio, and Studio carries no exposure for lost profits or other
knock-on losses.
`;

// Fair except for one marginal call: net 45 is past the 30 days the clause
// library calls fine, but common and not outrageous. ADR 0005 says flag it.
// The contract's own wording uses "may", which must not trip the hedge scan.
export const marginalContract = `WEBSITE BUILD AGREEMENT

1. Services. Contractor will design and build a five-page website for Client.

2. Ownership. Ownership of the finished website passes to Client on final
payment. Contractor keeps all code, components, and tools that existed before
this Agreement.

3. Payment. Client shall pay each invoice within forty-five (45) days of
receipt. Late payments accrue interest at 1% per month.

4. Acceptance. Client may request changes within five (5) business days of
each delivery; after that, the delivery is accepted.

5. Termination. Either party may end this Agreement with fourteen (14) days'
written notice, and Client shall pay for all work done up to the end date.

6. Liability. Each party's total liability is limited to the fees paid under
this Agreement, and neither party is liable for indirect losses.
`;
