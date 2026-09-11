# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, deployed on Vercel. Supabase for auth and database. The model is
called through OpenRouter (never a provider API directly). The uploaded file
(PDF or DOCX) is parsed in the browser — only the extracted text is stored,
never the original file. No OCR: a citation into misread text would break the
citation guarantee, so scanned documents are out of scope. (`CLAUDE.md`,
`docs/adr/0002`.)

## Users

The freelancer who negotiates: an independent contractor reviewing a services
agreement, statement of work, or IP/brand-deal contract **before signing it**,
who will push back on terms rather than sign as-is. Two things define them:
they can still change the deal, and a counter-offer is something they will
actually send. Their workflow is recurring, mostly short contracts. (ADR 0003.)

Deliberately narrower than "freelancers" generally — research shows fewer than
1% of freelancers who lose wages to non-payment ever use the legal system.
Redline is for the fraction who will act. Whether that fraction is large
enough is unproven and the first thing customer conversations should test
(PRD §1, §8).

**Not the target:** consumers reviewing SaaS terms of service or subscription
auto-renewal terms (best-evidenced pain in the research, deliberately cut —
no counter-offer path exists for a "stuck," non-negotiating user). Also not
the target: renters, already-signed users, small businesses. A freelancer's
own lease will be analysed if uploaded, but the analysis is not tuned for
leases and the product says so. (ADR 0003.)

## Product Purpose

Redline reviews a freelance contract before it is signed and returns an
analysis the user can trust, plus a counter-offer they can send. This version
exists to prove the analysis is trustworthy — every other consideration is
subordinate to that (`CLAUDE.md`, PRD).

The problem: a freelancer signs an agreement they haven't fully read or can't
fully parse, under time and money pressure. The terms that will hurt them are
invisible at signing and expensive later. A lawyer would catch them and costs
more than the contract is worth (PRD §2).

## Positioning

Wrong and hallucinated citations are the #1 accuracy complaint across existing
contract-review tools, including the best-liked one. Redline's mechanism a
neighboring product can't casually copy: **every flag cites the exact
verbatim source sentence it came from, and a flag whose source can't be shown
is not shown at all** — a structural guarantee, not a quality target (ADR
0001, research §3).

The market is split with a hole in the middle: lawyer-grade tools cost
$3,500–$200,000/year and are Word-only; consumer tools are cheap but shallow
(no ranked clauses, no counter-offers, no grounded Q&A) or have discredited
"AI lawyer" claims. A cluster of near-identical tools already exists in this
exact feature shape (severity flags + citations + negotiation letter + Q&A,
mostly scoped to residential leases) — none have a track record. The opening
is "no one does this *trustably* yet," not "no one does this" (research §3,
§5; PRD §8).

**The product makes two of its own judgment calls, and both must read as
Redline's, not the document's:** whether a clause's asymmetry is unjustified
(the "danger, not unusual" asymmetry test, ADR 0004), and whether a
protection is missing (the "Not in this contract" silent-risk section, ADR
0006). Everything else in the output states only what the document says.

## Operating Context

The core loop: upload a contract (PDF/DOCX) → get a plain-English summary,
severity-ranked flags each with a source sentence, a drafted counter-offer
per flag, a "Not in this contract" list of absent protections, and a
document-grounded question box → optionally check the document against the
user's own saved red lines → save the document to a personal library.

Price ceiling the product must work under: the self-serve market has revealed
willingness to pay ~$1–3/document or ~$30–90/year, against $390–700+ for a
lawyer. No one has *stated* a price; every number is revealed from competitor
pricing (PRD §1, §8; research §4).

## Capabilities and Constraints

**Confirmed capabilities (build these, then stop — CLAUDE.md, PRD §3):**

1. Plain-English summary of the document.
2. Severity-ranked flags for dangerous clauses, each with its exact source
   sentence. A flag with no citable source sentence is a bug and is not shown
   (ADR 0001).
3. A drafted counter-offer per flagged clause.
4. A question box that answers only from the uploaded document, and says so
   explicitly when the document doesn't contain the answer.
5. An editable list of the user's own red lines that drives the analysis
   (distinct from the built-in heuristics that apply to every document).
6. A saved library of the user's past documents.
7. A "Not in this contract" section: absent protections the freelancer should
   have, driven by a fixed checklist (liability cap, payment deadline with
   consequence, pre-existing-IP carve-out, kill fee, defined
   acceptance/approval window, and similar). Exempt from the citation rule
   (there's no sentence to cite for an absence) and kept visually and
   verbally distinct from flags so the two claim-types are never confused
   (ADR 0006).

**Explicitly excluded from this version — do not propose (CLAUDE.md, PRD §7):**
payments/billing; sharing a document between users; OCR for scanned
documents; terms-of-service/subscription review; analysis tuned for leases;
the post-signing "what am I bound by" framing; anything beyond the seven
capabilities above (case-law summarization, contract-database comparison,
negotiation-round tracking, e-signing).

**Terminology (use exactly — CONTEXT.md):** *flag*, *source sentence*,
*counter-offer*, *red line* (user-supplied, per-user) vs. *heuristic*
(built-in, applies to everyone), *asymmetry test*, *silent risk*, *"Not in
this contract"*, *clean result* (a document with nothing worth flagging —
evidenced by naming the checks run and passed, not an empty screen; ADR
0005).

**Voice constraint that is a product requirement, not just a copy
preference:** no hedge words anywhere in Redline's own prose — "may,"
"might," "could be seen as," "potentially," "arguably." Every flag reads as a
statement or a specific question, never a qualified worry. Preferred error is
the false flag, not the miss, as a flat rule across severities (ADR 0005).
Per `CLAUDE.md`, all user-facing copy must also pass through the humanizer
skill before it ships — "sounds like a model wrote it" is a separate bug from
containing a hedge word.

**Open/undecided facts, recorded rather than invented:**

- Whether the name "Redline" stays. A different consumer app already uses
  it (redlineapp.net, AI contract review at $2/scan). The user has flagged
  this as open to renaming rather than settled — treat "Redline" in this
  document and existing docs as the working name only, not a locked brand
  decision.
- Whether the freelancer segment ("will act on a contract, not just feel the
  pain") is large enough to be a business — explicitly untested (PRD §8).
- Whether the unit economics work at the $1–3/document price ceiling against
  frontier-model inference over long documents plus counter-offer drafting
  plus grounded Q&A (PRD §8, ADR 0002).
- Whether a standalone upload destination gets used at all, versus a
  moment-of-forced-attention delivery (browser extension at e-signing, a
  marketplace integration) — this version assumes the standalone destination
  and that assumption is untested (PRD §8).

## Brand Commitments

No visual identity, logo, or locked name exists yet. "Redline" is the
working name used throughout the existing docs, but the user has marked it
open to renaming (see Capabilities and Constraints, "Open/undecided facts") —
do not treat it as a final brand commitment. Voice is a confirmed brand
commitment: direct about what the text says, explicit and specific about
what it doesn't know, never hedged (ADR 0005); user-facing copy must be
passed through the humanizer skill before shipping (`CLAUDE.md`).

## Evidence on Hand

None yet. No real (anonymized) sample contracts, logos, testimonials, or
other real evidence exist to draw on. Design and engineering fixtures must
use clearly synthetic placeholder contract content — never fabricate
testimonials, customer logos, benchmarks, or pricing evidence to fill this
gap (confirmed with the user during init).

## Product Principles

1. **The citation is the product.** A flag that cannot show its exact source
   sentence is not a degraded result — it's a bug, and it's dropped rather
   than shown weakened (ADR 0001).
2. **Danger, not deviation.** A clause is flagged for what it can do to this
   user, not for being unusual. A standard clause can be dangerous; an
   unusual clause can be harmless (ADR 0004).
3. **State what the text says; own the two judgments that are Redline's.**
   Everything in the output stays with the document's words except two
   deliberate judgment calls that must read as the product's own: unjustified
   asymmetry, and a missing protection (`CLAUDE.md`, ADR 0004, ADR 0006).
4. **Prefer the false flag over the miss.** The downside is asymmetric — a
   false flag costs a little negotiating capital, a missed existential clause
   can cost the user everything (ADR 0005).
5. **Never hedge; be confident only about what's verifiable.** Confident
   about what the text says, specific and direct about what the tool doesn't
   know — never a qualified worry (ADR 0005).

## Accessibility & Inclusion

No product-specific requirement established yet.
