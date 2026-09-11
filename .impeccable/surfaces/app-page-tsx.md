---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app-shell"]
---

## Scope & mode

Persuade. Public, pre-auth landing page at `/` (`app/page.tsx`) — the whole
surface for today's build. Related surface: the app shell (`app-shell`
brief), behind sign-in, sharing this world but not built today.

## Audience & job

The freelancer who negotiates (PRODUCT.md, ADR 0003) — an independent
contractor about to accept a contract they feel they cannot push back on.
Job here: decide in seconds whether this tool earns enough trust to upload
their real document.

## Action / task

One action: try it on a document. No pricing, no account creation visible
on this page — that belongs to the app shell.

## Proof / content

The demonstration is the proof: a real (synthetic, labeled) contract clause
turning into a cited, ranked flag on screen. Real product name, "Redline."
No invented prices, customers, or quotes. Claims nothing the spec excludes:
no verdict on whether to sign, no legal advice, no scanned/photographed
documents, no document types beyond services/SOW/IP/brand-deal agreements
(PRD §1, `CLAUDE.md`).

## Constraints

No OCR or scanned-document claims anywhere on the page. Voice carries no
hedge words (ADR 0005). All shipped copy passes through the humanizer skill
before commit (`CLAUDE.md`).

## Direction contract

THESIS: Redline's own name, rendered as the literal editing grammar of a
redlined contract — every risk claim appears as a tracked-change annotation
pinned to its exact source span, never a dashboard of verdict cards. Refuses
the glossy "AI analysis panel" arrangement every contract-review SaaS ships.

OWN-WORLD: Paper-white document ground (#ffffff), near-black body ink
(#1a1a1a), one alarm-red for flags/deletions (#c0261a), a controlled green
for confirmed-present protections (#1f6f3f), a quiet gray margin rail
(#f4f4f4 fill, #8a8a8a rule). The document itself is the interface: rendered
contract text with strikethrough/insertion markup, a vertical margin
change-bar beside every touched line, a comment balloon pinned by a leader
line to its exact sentence. A workmanlike serif document-body face (reads as
a real filed document, not a display face) paired with a quiet system-ui-
adjacent sans for chrome — labels, rail, the one button — that never
competes with the document.

STORY: A visitor arrives mid-panic, about to accept something they feel
they can't negotiate. In the first viewport a real contract clause visibly
acquires redline marks: a red margin bar, an underlined sentence, a comment
balloon naming the danger with the exact quoted clause inside it — checkable
at a glance. They believe: "this points at my actual sentence," the direct
answer to the #1 complaint (wrong citations) the research found. They act:
upload their own document, the page's one action.

FIRST VIEWPORT: A single, faithfully typeset contract clause — not a card,
no browser/app chrome — fills the upper two-thirds of the frame exactly as
it would sit in the source document. A red margin change-bar runs beside
its most dangerous sentence, which is itself underlined in red. A comment
balloon, connected by a short leader line, sits in the right margin (stacks
below the clause on narrow viewports) naming the flag in Redline's direct
voice, no hedge words. A small fixed masthead names the product at the very
top — not a hero logo lockup — with one line stating what Redline does, and
the single call to action ("Try it on a document") as a plain, high-contrast
button: no gradient, no glow. Nothing else competes for this viewport; the
demonstration is the pitch.

FORM: The Blackline — Word/Google Docs track-changes markup, the industry
term for a redlined contract comparison. Ranked #1 on the resonance-ordered
candidate list (IMPECCABLE'S PICK); chosen directly over the dice-assigned
Carbon Copy direction on the decision page. Seed key 4f708197 (scope:
direction, mode: persuade).

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying
its provenance.

## Unresolved decisions

- Exact synthetic demonstration clause text — authored at build time,
  clearly labeled synthetic, never presented as a real client's contract.
- Whether the masthead previews sign-in at all, given the app shell lives
  behind auth and is brief-only today, not built.
