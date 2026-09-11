---
name: Redline
description: A freelancer's contract, rendered as its own redline — every flag is a tracked-change annotation pinned to the exact sentence it came from.
colors:
  paper: "#f2f0ea"
  page: "#fffdf9"
  ink: "#1c1a16"
  ink-quiet: "#58544a"
  rule: "#ddd8cc"
  flag-severe: "#b3261e"
  flag-severe-tint: "#fbeae9"
  flag-high: "#9c5a12"
  flag-high-tint: "#fbf0e2"
  confirm: "#2f6d4c"
  focus: "#1d5fd6"
typography:
  document-body:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  document-lockup:
    fontFamily: "Source Serif 4, serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  quote:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "0.9rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  chrome-body:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  chrome-label:
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
  md: "3px"
  lg: "4px"
spacing:
  xs: "0.5rem"
  sm: "0.85rem"
  md: "1.25rem"
  lg: "2.25rem"
  xl: "2.75rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    typography: "{typography.chrome-body}"
    rounded: "{rounded.md}"
    padding: "0.85rem 1.85rem"
  button-primary-hover:
    backgroundColor: "{colors.flag-severe}"
    textColor: "{colors.page}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.chrome-body}"
    padding: "0"
  balloon-severe:
    backgroundColor: "{colors.flag-severe-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.85rem 1rem"
  balloon-high:
    backgroundColor: "{colors.flag-high-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.85rem 1rem"
---

# Design System: Redline

## Overview

**Creative North Star: "The Blackline"**

Redline's first surface is named after what it is: a Word/Google Docs
track-changes markup — the industry term for a redlined contract comparison.
There is no dashboard, no card grid, no "AI analysis panel." The contract
itself, rendered faithfully, is the interface: a margin change-bar, an
underlined flagged sentence, and a comment balloon pinned by a leader line to
the exact clause it concerns. The system exists to make one thing checkable
at a glance — this points at my actual sentence — because wrong citations are
the product's stated #1 trust problem to solve (PRODUCT.md, ADR 0001).

The world is quiet on purpose. The one accent that's allowed to be loud is
the flag itself; everything else — masthead, button, tagline — sits in
restrained system-ui gray-on-cream so it never competes with the document
being marked up. Confirmed rejection: no dashboard/verdict-card arrangement,
no gradient or glow on the call-to-action, no card chrome wrapping the
document (an explicit finish-review fix — body, masthead, and document now
share one background rather than sitting in a boxed container).

**Key Characteristics:**
- Document-as-interface: no card wrapping the contract; the page background
  *is* the document's background.
- One loud color family per severity tier, everywhere else restrained gray/cream.
- Staggered, severity-ordered reveal: the redline marks itself in front of you.
- A workmanlike document serif for contract text, quiet system-ui for
  everything that isn't the document.

## Colors

A paper-and-ink palette carrying two deliberately allowed alarm colors, one per severity tier that appears on this surface.

### Primary
- **Alarm Red** (`#b3261e`, flag-severe): the Severe severity tier — margin bar, underline, comment-balloon border/tag/quote for the most dangerous clause. Also the CTA's hover state and the text-selection color, so the accent is not confined to the document alone.

### Secondary
- **Redline Amber** (`#9c5a12`, flag-high): the High severity tier. **Decided extension, not part of the original OWN-WORLD palette.** The direction contract's OWN-WORLD block named a closed red/green/gray palette anticipating a single severity tier ("one alarm-red for flags"). The product's real severity model ranks flags Severe > High > Moderate (CLAUDE.md capability 2, ADR 0004), so a second flag color was added at build time to keep tiers visually distinct from each other, not only from confirmed-present green. Paired with its own tint (`#fbf0e2`, flag-high-tint) exactly as `flag-severe` is paired with `flag-severe-tint` (`#fbeae9`).

### Neutral
- **Page** (`#fffdf9`): the body/masthead/document background — one continuous surface, not a card.
- **Paper** (`#f2f0ea`): scrollbar track and the after-select confirmation panel; a half-step warmer than Page, used sparingly as a secondary surface.
- **Ink** (`#1c1a16`): body text, clause numbers, the primary CTA's fill.
- **Ink Quiet** (`#58544a`): the tagline and the synthetic-clause caption — secondary chrome text.
- **Rule** (`#ddd8cc`): hairline dividers between clauses and under the sticky masthead.

### Unused-on-this-surface (recorded, not yet applied)
- **Confirm Green** (`#2f6d4c`) and **Focus Blue** (`#1d5fd6`) are defined as CSS custom properties in `globals.css` — Confirm for the future "Not in this contract" / confirmed-present-protection state (ADR 0006), Focus for the `:focus-visible` outline used sitewide — but neither renders a flag or button on this landing surface today. Recorded here because they are already load-bearing tokens (focus ring is live), not because they're proven UI yet.

### Named Rules
**The One Accent Per Tier Rule.** A clause's margin bar, underlined sentence quote-in-balloon, and balloon border/tag all read in the same severity color (`--sev-color`), switched by a single `data-severity` attribute. No clause ever mixes tier colors within itself.

## Typography

**Document Font:** Source Serif 4 (with Georgia, serif fallback) — loaded via `next/font/google`, exposed as the `--font-document` custom property.
**Chrome Font:** system-ui (with -apple-system, Segoe UI, sans-serif fallback) — not a named webfont.

**Character:** A workmanlike serif that reads as a real filed document, not a display face, carrying every word of contract text (clause numbers, lead-in text, the flagged sentence, the comment balloon's quoted excerpt, even the masthead wordmark). A plain system font carries everything that is Redline's own voice rather than the document's words — labels, the tagline, the CTA, the balloon's advisory note — so chrome never competes with, or is mistaken for, the document.

### Hierarchy
- **Document Lockup** (600, 1.1rem, 1.2 line-height, -0.01em): the sticky masthead wordmark — set in the document serif, not a UI face, to declare the whole surface as a document from the first pixel.
- **Body/Document Text** (400, 1.05rem, 1.7 line-height, max 68ch): clause lead-in and flagged-sentence text, set in Source Serif 4.
- **Quote** (400 italic, 0.9rem, 1.45 line-height): the exact quoted clause inside a comment balloon, colored to its severity tier.
- **Chrome Body** (400, 0.95–1.05rem, 1.5 line-height): tagline, balloon advisory note, after-select confirmation text — all system-ui.
- **Chrome Label** (700, 0.68rem, uppercase, 0.08em tracking): the balloon's severity tag ("Severe" / "High").

### Named Rules
**The One Document Face Rule.** Any text that is the contract's own words — clause numbers, lead-in, flagged sentence, quoted excerpt in a balloon — is set in Source Serif 4. Any text that is Redline's own voice — labels, tagline, button, advisory note — is set in system-ui. No third face, no display face; the pairing exists to keep the document legible as a document.

## Layout

A single centered column, not a dashboard grid. The document block caps at `44rem`; the pitch/CTA block below it caps narrower at `34rem`. Horizontal padding is `1.25rem` at the edges, with the document's own internal padding widening on larger viewports (`clamp(1.25rem, 4vw, 3rem)`).

Below `860px`, each clause stacks: document text on top, comment balloon directly beneath it, full width. At `860px` and up, the clause becomes a two-column grid (`1fr` document / `17rem` balloon) and the balloon gains a `1.4rem` leader line connecting it back to the flagged text — the margin-annotation posture the direction contract specifies as native to this world, present only where there's room for it.

The masthead is `position: sticky` at the top, sharing the page background with a `1px` rule beneath it rather than its own surface color — reinforcing the no-chrome, one-continuous-surface stance.

## Elevation & Depth

Flat. No shadows anywhere in the built surface — not on the masthead, the CTA, or the comment balloon. Depth and grouping come from hairline rules (`1px solid var(--rule)` between clauses, under the masthead) and from a `1px` severity-colored border on the comment balloon itself, not from box-shadow or z-axis lift.

### Named Rules
**The No-Card Rule.** The document, masthead, and page body all share the same `--page` background with no bounding box, border, or shadow separating them — a finish-review correction to an earlier boxed-container treatment. Only the comment balloon and the after-select confirmation panel get a bounded surface (tint fill + `1px` border), because they are the one place a distinct "this is an annotation, not body text" signal is load-bearing.

## Shapes

Corners are uniformly small and quiet: `2px` on the focus outline, `3px` on the CTA and balloon tag, `4px` on the comment balloon and after-select panel. Nothing in the system uses a large radius or a pill shape. The margin change-bar is a `4px`-wide vertical rectangle with `2px` corners that grows from `scaleY(0)` to `scaleY(1)` on entrance — the system's one recurring non-rectangular gesture, styled as a literal editing mark rather than a decorative shape.

## Components

### Buttons
- **Shape:** `3px` radius, all buttons.
- **Primary (CTA):** ink-fill (`#1c1a16`) on page background text, `0.85rem 1.85rem` padding, system-ui `600` weight, no border, no gradient, no glow — matches the direction contract's explicit call for "a plain, high-contrast button."
- **Hover:** background shifts to `--flag-severe` (`#b3261e`) — the one place the alarm color appears outside a flag itself, tying the call-to-action back to the redline metaphor.
- **Ghost (reset link):** no fill, no border, underlined system-ui text, `600` weight; hover recolors to `--flag-severe` matching the primary button's hover logic.

### Comment Balloon (signature component)
The pinned annotation that carries a flag's verdict. Background is the severity tint (`--sev-tint`), border is `1px solid` the severity color (`--sev-color`), radius `4px`, internal padding `0.85rem 1rem`. Structure is fixed: an uppercase severity tag chip (severity-colored fill, page-colored text) at top, the exact quoted flagged sentence in italic document serif colored to the severity tier beneath it, then the advisory note in system-ui ink. On desktop a `1.4rem` leader line in the severity color extends from the balloon back toward the clause it annotates.

### Margin Change-Bar (signature component)
A `4px`-wide, severity-colored vertical bar to the left of a flagged sentence, `2px` corner radius. Present per flagged sentence, not per clause — a clause with no flagged sentence carries no bar.

### Navigation / Masthead
A single sticky bar: the product wordmark set in the document serif (not the chrome font), `600` weight, `1.1rem`, tight tracking (`-0.01em`). No nav links, no account/sign-in affordance on this surface (app shell lives behind auth and is out of scope for this build). Bottom-bordered with the `--rule` hairline; background matches the page, not a distinct chrome color.

## Do's and Don'ts

### Do:
- **Do** carry every severity tier in a single color pair (fill + tint), keyed off `data-severity`, never a one-off inline color.
- **Do** set contract-text content (clause numbers, lead-in, flagged sentence, quoted excerpt) in the document serif; set Redline's own voice (labels, buttons, advisory notes) in system-ui.
- **Do** let the document and its chrome share one background; a bounded box is reserved for an annotation (balloon) or a status panel (after-select), never for the document itself.
- **Do** keep the CTA plain and high-contrast — ink fill, no gradient, no glow — per the direction contract's explicit instruction, with the alarm-red hover as the only departure.

### Don't:
- **Don't** introduce a third severity color, a dashboard/verdict-card layout, or a boxed document container — all three are confirmed rejections of this surface's own direction contract and finish review.
- **Don't** apply a drop shadow or elevation lift anywhere; this system conveys grouping with hairline rules and tint/border fills only.
- **Don't** treat `--confirm` (green) or `--focus` (blue) as decorative — green is reserved for the not-yet-built "confirmed present protection" state (ADR 0006) and blue is the live focus ring; neither is a free-choice accent color.
- **Don't** set UI chrome (labels, buttons, nav) in the document serif, and don't set contract text in system-ui — the pairing's whole job is to keep the two registers visually distinct.
