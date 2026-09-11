---
version: 1
slug: "app-shell"
primary_target: "app-shell"
related_targets: ["app/page.tsx"]
---

## Not built today

Brief only, per explicit instruction. No app screen is implemented in this
pass — this record exists so the next session has a world and a composition
to build against instead of inventing one cold.

## Scope & mode

Operate. Behind sign-in. The persistent frame around every document review:
paste-or-upload, the result (summary, ranked flags, clean verdict), the
question box, the reader's own red lines, and the library. Related surface:
the landing page (`app/page.tsx` brief) — same visual world, Persuade mode.

## Audience & job

The freelancer who negotiates (PRODUCT.md, ADR 0003), now past the pitch and
inside the tool, doing the actual task repeatedly across a recurring stream
of short contracts. Job: get from "here's a document" to "here's what to
push back on" with nothing standing between them and the report.

## Task / information / states / frequency

- Entry points: paste text or upload a PDF/DOCX; parsed in-browser, only
  extracted text stored (`CLAUDE.md`).
- Primary states: empty (no document open), analyzing, result (with flags),
  clean result (nothing worth flagging — evidenced, not blank, ADR 0005),
  question-box interaction, red-lines editor, library.
- The report itself is not a separate page's concern here — this brief
  covers the frame that holds it: navigation between an open document, the
  library of past documents, and the user's red-lines list, plus whatever
  chrome the result view sits inside.
- Recurring, mostly short-contract workflow (PRD §1) — this frame is
  revisited often, not a one-time destination. Optimize for a returning
  user's speed, not first-time spectacle.

## Proof / content

Continuity with the landing page's demonstration is the trust mechanism
here too: the same markup grammar the visitor saw work on a stranger's
clause now runs on their own document. No invented data — library entries,
red lines, and results are the user's real saved state or, until real
documents exist, clearly synthetic placeholders (PRODUCT.md, "Evidence on
Hand").

## Constraints

Same voice rule as the whole product: no hedge words, every flag reads as a
statement or a specific question (ADR 0005). The "Not in this contract"
section stays visually and verbally distinct from flags — it carries no
citation (ADR 0006) and must never be mistaken for one. All shipped copy
passes through the humanizer skill before commit (`CLAUDE.md`).

## Direction contract

THESIS: The frame is a document under review, not a dashboard wrapped
around one — navigation, the library, and the red-lines editor all present
themselves as parts of the same physical document object the markup lives
on, never as a separate app shell bolted around a report.

OWN-WORLD: Inherits the landing page's Blackline world unchanged — paper-
white document ground, near-black ink, one alarm-red for flags, a
controlled green for confirmed-present protections, the quiet gray margin
rail. In the app frame, that margin rail becomes a fixed left rail styled as
the document's own margin — tabs for Library and Red Lines sit on it like
tabs on a folder, not like a SaaS sidebar. The result view continues the
same tracked-change grammar: flags as pinned comment balloons on their exact
sentence, red for danger, green for present-and-fine, never a card grid.

STORY: A returning user opens a document (paste, upload, or from the
library) and watches the same redline markup they saw demonstrated on the
landing page apply to their own contract — summary up top in plain prose,
flags as inline annotations ranked by severity, "Not in this contract" set
apart in its own visually distinct block, a clean result stated plainly
with its checklist shown. They ask the question box something and get an
answer pinned to a passage, or an explicit "the document doesn't say." They
edit their red lines from the same rail and see the next analysis check
against them.

FIRST VIEWPORT (on opening a result): The left margin rail (Library, Red
Lines, account) stays narrow and quiet; the main pane is the document itself
— plain-English summary first, then the contract body carrying its own
markup inline, flags as balloons pinned to their sentences in ranked order.
"Not in this contract" renders as a clearly separate block below the
document, not another flag. The question box docks at the bottom of the
main pane, always reachable, never a floating chat bubble.

FORM: The Blackline, inherited directly from the landing page's chosen
direction — no separate roll for this surface; concept-seed's direction
scope covers a "substantially different future surface" by design. Seed key
4f708197 (scope: direction, mode: persuade), chosen as `model-pick`.

FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying
its provenance.

## Unresolved decisions

- Exact library list composition (thumbnails vs. plain rows) and how many
  saved documents are shown before pagination.
- Whether red lines are edited inline in the rail or in a dedicated panel.
- Sign-in/auth screen treatment — out of this brief's scope; the frame
  starts from "already signed in."
- How the question box's answer citations render when the passage is long.
