# Redline — Product Brief

Redline reviews a freelance contract before it is signed. Upload the contract —
a PDF or DOCX, parsed in the browser so only the extracted text is stored — and
get back a plain-English summary, a ranked list of clauses that could hurt you —
each tied to the exact sentence it came from — a drafted counter-offer for each,
a list of protections the contract is missing, and a question box that answers
only from the document.

This version exists to prove one thing: that the analysis can be trusted. Every
other consideration is subordinate to that. The decisions behind this brief are
recorded in `docs/adr/`; the vocabulary is in `CONTEXT.md`.

---

## 1. Who this is for

**The freelancer who negotiates.** An independent contractor who reviews a
services agreement, statement of work, IP or brand-deal contract **before signing
it**, and who will push back on terms rather than sign as-is. Two things define
them: they can still change the deal, and a counter-offer is something they will
actually send. (`docs/adr/0003`.)

The brief assumes this person sees contracts often enough for a review tool to
earn a place in their workflow. That is an assumption, not a finding — §8 is
where it gets tested.

This is deliberately narrower than "freelancers." The research finds that fewer
than 1% of freelancers who lose wages to non-payment ever use the legal system
([Authors Guild survey of NY freelancers](https://authorsguild.org/news/survey-finds-62-percent-of-ny-freelance-workers-have-lost-wages-due-to-nonpayment/)) —
most people in this pain do not act on contracts at all. Redline is for the
fraction who will. If that fraction is too small, the product thesis is wrong,
and this is the first thing customer conversations should test.

### What they do today instead

- **Sign it without a real review.** The most common path. Low engagement with
  the contract is itself the core problem, and it is also a distribution problem:
  a tool that requires someone to stop and upload a document is asking for
  behaviour this group has repeatedly not shown (research §5.4).
- **Pay a lawyer.** About $390 for a flat-fee contract review, or $200–350 an
  hour (research §4). Freelancers in the research describe this as
  "$300–500+ per contract … unsustainable" (§4) — more than many contracts are
  worth.
- **Paste it into a general AI chatbot** with no legal grounding and no source
  citations, or ask a more experienced peer.

The market has revealed what this group will pay for self-serve review: about
**$1–3 per document, or $30–90 a year** (research §4). That is the price ceiling
Redline works under, and it constrains everything — model cost included
(`docs/adr/0002`).

---

## 2. The problem

A freelancer signs an agreement they have not fully read or cannot fully parse,
under time and money pressure. The terms that will hurt them — an IP assignment
that sweeps in tools they built before the job, an uncapped indemnity, a
termination clause that lets the client walk without paying for work already done
— are invisible at signing and expensive later. A lawyer would catch them and
costs more than the contract is worth. There is no trustworthy option in between.

The closest first-person account the research contains is from an employee, not a
freelancer, looking back after signing:

> "I almost didn't sign but I also couldn't afford to go without a job. Two years
> later I'm trying to figure out exactly what I signed because I believe it was
> very limiting."
> — [Hacker News, thread 9729916](https://news.ycombinator.com/item?id=9729916)

That quote is not squarely on target — it is employment, not freelance, and it is
someone in the post-signing position Redline does not serve. It is included
because **the research has no better first-person freelance account**: Reddit,
the richest source of "I got burned by a contract" stories, was unavailable
during the research, so the qualitative evidence is thin exactly where Redline
aims (research §5.5). The freelance-specific evidence that does exist is
quantitative: 62% of NY freelancers have lost wages to non-payment; of those, 22%
lost more than $5,000 ([Authors Guild](https://authorsguild.org/news/survey-finds-62-percent-of-ny-freelance-workers-have-lost-wages-due-to-nonpayment/)).
The mechanism is usually a clause — "payment on approval," net-60/90, kill fees
(research §1).

There is also a market reason this is worth doing now. Wrong and hallucinated
citations are the number-one accuracy complaint across the existing tools,
including the best-liked one (research §3). A tool that ties every claim to a
verbatim sentence, and shows nothing it cannot tie, is attacking the exact
weakness of the incumbents.

---

## 3. What the first version does

Build these. Nothing beyond them. If something looks obvious but is not on this
list, it is a scope change and needs a decision first.

1. **Plain-English summary** of the document.
2. **Flags** — clauses that could hurt the user. Flagged for *danger*, not for
   being unusual (`docs/adr/0004`). Ranked by severity. Each flag shows the exact
   source sentence it came from; a flag whose source sentence cannot be shown is
   not shown at all (`docs/adr/0001`).
3. **A drafted counter-offer** for each flagged clause, written for the user to
   send to the other party.
4. **A question box** that answers only from the uploaded document, and says so
   when the document does not contain the answer.
5. **An editable list of the user's own red lines** — rules like "no assignment
   of IP before payment clears" — that the analysis checks every document
   against.
6. **A saved library** of the user's past documents.
7. **A "Not in this contract" section** — a separate, visually distinct list of
   protections a freelancer should have that this contract omits: a liability
   cap, a payment deadline with a consequence, a carve-out for pre-existing IP, a
   kill fee, a defined acceptance window (`docs/adr/0006`). This section makes
   claims about what is *absent*, so it carries no source sentences and is kept
   clearly apart from the flags.

---

## 4. What good looks like

How someone decides whether the analysis is any good. Each item is a test to run,
not a feeling. Thresholds marked "TBD" are set once the test set exists; the
description says what an acceptable result means.

- **Citation integrity.** Every flag shows a source sentence that appears
  verbatim in the stored document text (character-for-character after whitespace
  normalisation). Target: 100%. Any miss is a release-blocking bug, not a quality
  metric (`docs/adr/0001`).
- **Recall on dangerous clauses.** On a held-out set of real freelance contracts,
  each annotated by a competent reviewer for the clause categories in §5, Redline
  flags the Severe and High items. Acceptable means: a user could rely on it not
  to miss an existential clause. Threshold TBD against the test set; a single
  missed Severe clause in the set is a failure to investigate, not a rounding
  error.
- **False-flag rate.** On contracts a competent reviewer judged fair, every flag
  Redline raises is still defensible on the asymmetry test, even if minor.
  Measured by reviewer disagreement with raised flags. The bias is toward
  over-flagging (`docs/adr/0005`); the bound is that a reviewer would not call
  any individual flag *wrong*.
- **Severity stability.** The same contract analysed five times produces the same
  flags in the same severity order (`docs/adr/0002`, `docs/adr/0004`).
- **Silent-risk detection.** On contracts each missing exactly one §5 protection,
  the "Not in this contract" section names that protection. On contracts that
  include it in varied wording, the section does not report it missing.
- **The clean result.** A contract a reviewer judged fair produces the clean
  result — a plain "nothing here needs your attention" plus the list of checks
  run — and not a single invented flag (`docs/adr/0005`).
- **Counter-offer quality.** For each flag, a competent reviewer rates the
  drafted counter-offer accept / revise / reject. Acceptable means most are
  "accept" or "revise," it addresses the specific clause, it is not a maximal
  demand a client would walk over, and it introduces no new problem term.
- **Q&A grounding.** On a question set with answerable and unanswerable
  questions: answerable ones are answered with the passage cited; unanswerable
  ones get "the document doesn't say," not an answer from general knowledge.
- **Voice.** Redline's own prose — everything outside the quoted source sentences
  — contains no hedge words: "may," "might," "could be seen as," "potentially,"
  "arguably." Every flag reads as a statement or a question, never a qualified
  worry (`docs/adr/0005`). Checked by scanning the generated text with the quoted
  spans removed.
- **Time to understanding.** A freelancer unfamiliar with the contract can, after
  reading the report, correctly name the top three things to push back on. Tested
  in user sessions.

---

## 5. My red lines: which clauses I flag, how severely, and why

Severity sets the order flags are shown, their visual weight, and whether they
appear in the summary. It is ranked by **how badly and how irreversibly the
clause can hurt this user** — not by how common the clause is or how often it
draws complaints (`docs/adr/0004`).

### Severe — shown first, always in the summary

1. **IP assignment, sharp edges only.** Assignment of the freelancer's
   pre-existing IP or general tools; assignment that vests before payment clears;
   a grab of moral rights or the right to show the work in a portfolio. *Why:*
   irreversible — you cannot claw back assigned rights — and it compounds by
   pulling in work that was never part of the deal. There is no small-claims path
   to undo it. A plain work-for-hire assignment of the commissioned deliverable
   is **not** here; it is shown as context so a user who does not know it is
   normal is not left guessing.
2. **Uncapped liability and broad indemnification.** The freelancer personally on
   the hook for the client's losses with no ceiling. *Why:* it can end a
   person's finances over a single dispute. The research rates this only
   "weak-to-moderate" on evidence — but that is because people do not post online
   after a catastrophe, not because it is rare or mild (research §2). This is
   often a *silent* risk: the danger is the absence of a cap, which the "Not in
   this contract" section handles.

### High — shown next, in the summary if present

3. **Termination for convenience with no payment for work done.** The client can
   walk at any time and the freelancer loses the value of the unbuilt balance.
   *Why:* turns a booked project into an option the client holds for free.
4. **Payment terms that delay or gate payment.** Approval-gated pay ("paid on
   acceptance," with acceptance undefined), net-60/90, kill fees invoked after
   most of the work is done. *Why:* the most common way freelancers actually lose
   money (research §1). Ranked below the first three because the damage is
   usually recoverable — this is the most frequent risk, not the most permanent
   one, and severity here tracks permanence.

### Moderate — shown, not necessarily in the summary

5. **Non-compete, exclusivity, non-solicit.** Clauses that stop the freelancer
   taking other clients during the engagement, or being hired later by the
   client's contacts. *Why:* quietly narrows the freelancer's business; often
   unnoticed at signing.
6. **Unilateral amendment.** "We may change these terms at any time." *Why:* the
   deal you signed is not the deal you are bound by.

### Context only — shown, not flagged

7. **Standard work-for-hire assignment of the deliverable**, ordinary
   confidentiality, a mutual limitation that is actually mutual. Shown so the
   report is complete and the user can see what was read, marked as normal.

---

## 6. The calls I made and what I gave up

Each entry: the choice, what it was chosen against, and who is worse off for it.

1. **Target the freelancer who negotiates.**
   Against: renters, small businesses, and consumers reviewing terms of service.
   Worse off: the renter facing a lease they cannot understand — a large,
   underserved group that near-identical lease tools already court on features;
   the solo consultant who would pay more; and the person trapped in a
   subscription's terms, whose pain the research rates highest of all.

2. **Serve the pre-signing moment.**
   Against: the freelancer who already signed and now needs to know what they are
   bound by.
   Worse off: that user — who has higher intent and a real trigger (a demand
   letter, a dispute) and is exactly the person in the §2 quote. Redline shows
   them flags they can no longer act on.

3. **Cut terms of service and subscription terms entirely.**
   Against: the best-evidenced pain in the whole research — auto-renewal and
   forced arbitration rank #1 and #2 by weight of complaint and enforcement
   evidence (research §2).
   Worse off: everyone dealing with a silent renewal, a cancel-by-phone-only
   clause, or a class-action waiver. Redline could describe those risks; it
   chooses not to, because there is no counter-offer to send and the user cannot
   negotiate.

4. **Rank severity by harm to this user, not by how often the clause draws
   complaints.**
   Against: ranking straight off the research's evidence table.
   Worse off: nobody directly — but this is a bet made ahead of the data. If the
   ranking is wrong, users see risks in the wrong order and calibrate to a scale
   that does not match reality.

5. **Flag danger, not unusualness — via the asymmetry test.**
   Against: the simpler "this clause is unusual for a contract like this," which
   users grasp instantly.
   Worse off: the user who wanted a quick "is this weird" read. And it puts a
   judgment call in the model's hands — whether an asymmetry is "beyond what the
   deal structure justifies" — which can be wrong in a way a norm-deviation check
   cannot.

6. **Prefer the false flag over the miss, as a flat rule.**
   Against: preferring the miss (rare, high-confidence flags), and against tuning
   the preference per severity.
   Worse off: the user who gets over-flagged, learns the flags include noise, and
   starts ignoring them — the "always finds problems, so nobody believes it"
   failure the research warns about (research §3, §5). This brief does not
   resolve how the UI keeps the clean result believable under a flat
   over-flagging rule; that is left to design (`docs/adr/0005`).

7. **Speak directly; never hedge.**
   Against: safe, qualified language that is defensible when wrong.
   Worse off: the user who acts on a confident statement that turns out to be
   wrong — worse, from a product whose pitch is trust, than a user who got a
   hedge and knew to check.

8. **Report missing protections in a section exempt from the citation rule.**
   Against: keeping the report single-natured — every claim citation-backed — or
   leaving silent risks out of scope entirely.
   Worse off: the user who does not notice that the "Not in this contract"
   section has weaker evidence behind it than the flags and treats the two the
   same.

9. **Call the model through OpenRouter, not a provider API directly**
   (`docs/adr/0002`).
   Against: calling Anthropic or OpenAI directly.
   Worse off: latency-sensitive use — there is a small overhead — and privacy:
   one more third party sees the document text, which forces a zero-retention
   configuration and reopens the decision if that cannot be guaranteed.

---

## 7. What we are not building, and why

- **Payments and billing.** Out of scope for this version; it proves trust, not
  monetisation.
- **Sharing a document between users.** Not part of the single-user review loop.
- **OCR for scanned documents.** A citation is worthless if the text it points at
  was misread. OCR would directly undermine the one thing this version proves
  (`CLAUDE.md`, `docs/adr/0001`).
- **Terms-of-service and subscription review.** See call 3 above.
- **Analysis tuned for leases.** A freelancer's own apartment lease will be
  analysed if uploaded, but the clause library and severity model are built for
  freelance agreements, and the product says so rather than pretending otherwise
  (`docs/adr/0003`).
- **The post-signing "what am I bound by / what's my recourse" framing.** See
  call 2.
- **Anything beyond the seven capabilities in §3.** Summarising case law,
  comparing against a contract database, tracking negotiation rounds, e-signing —
  all plausible, all out.

---

## 8. What the research could not tell us

- **Whether anyone will pay a sustainable price for this.** Every willingness-to-pay
  number in the research is *revealed* from competitor pricing, not *stated* by a
  user. No survey, no waitlist with pricing, no "take my money" thread was found
  (research §5.1). Close this with customer conversations before building beyond
  this brief.
- **Whether "the freelancer who negotiates" is a real, large-enough group.** The
  research shows the pain and shows that most people in it do not act
  (<1% litigate; §5.4). Whether the acting fraction is a business is unproven.
- **Whether this exact product already exists and works.** A cluster of
  residential-lease tools already ships severity flags, source citations, a
  negotiation letter, and Q&A; a cluster of generic tools already does
  per-document AI review at $1–3 (research §5.2). None have a track record
  because they are new. The opening is "no one does this *trustably* yet," which
  is a narrower wedge than "no one does this."
- **Whether the unit economics work.** $1–3 per document against a frontier model
  reading a long contract, then drafting counter-offers, then answering
  questions. The research flags this as unresolved (§5.3); this brief does not
  solve it.
- **Whether a standalone upload destination gets used at all**, versus a
  moment-of-forced-attention — a browser extension on the e-signing page, an
  integration inside a marketplace (research §5.4). This brief assumes the
  destination; that assumption is untested.
- **The qualitative texture of freelance contract pain.** Reddit was blocked
  during the research. The first-person evidence is strong for employment and
  subscriptions, thin for freelance, creator, and lease (research §5.5). A manual
  pass through r/freelance, r/legaladvice, and freelancer communities should
  happen before the product's clause priorities are treated as settled.
