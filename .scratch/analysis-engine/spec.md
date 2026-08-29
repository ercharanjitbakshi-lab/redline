# Spec — The analysis engine

Status: ready-for-agent
Feature slug: analysis-engine
Source: synthesized from PRD.md, CONTEXT.md, and docs/adr/0001–0006 (session
2026-08-29). No requirements interview — this is a synthesis of decisions already
made.

---

## Problem Statement

A freelancer has a contract in front of them and a decision to make before they
sign it. They cannot fully parse the legal language, they cannot justify a
lawyer's fee against what the contract is worth, and the terms that will hurt
them — an assignment that sweeps in work they did before the job, an uncapped
indemnity, a termination clause that lets the client walk without paying — are
invisible until it is too late. They need a read they can trust: one that shows
them what to push back on, points at the exact words it is worried about so they
can check it, and does not cry wolf.

Everything in Redline exists to prove that read can be trusted (`CLAUDE.md`).
This spec covers the part that produces the read: turning the extracted text of
a contract, plus the user's own red lines, into the analysis the rest of the
product presents.

## Solution

Given the already-extracted text of a contract and the target user's red lines,
the engine produces a **Report** containing:

1. A plain-English **summary** of the document.
2. A severity-ranked list of **flags** — clauses that could hurt the user. Each
   flag carries the **source sentence**: the exact, verbatim sentence from the
   document it came from. A flag whose source sentence cannot be shown is not in
   the Report at all (`docs/adr/0001`).
3. A separate **"Not in this contract"** section: a checklist of protections a
   freelancer should have, each marked present / absent / partial. This section
   makes claims about what the contract does *not* say, so it carries no source
   sentences and is kept distinct from the flags (`docs/adr/0006`).
4. When nothing is worth flagging, a **clean result**: the Report says so plainly
   and lists the checks that were run and passed (`docs/adr/0005`).

Flags are chosen by the **asymmetry test** — does the clause let the other party
act on the user with no reciprocal right, no cap, or no cure period, beyond what
the deal structure justifies — not by whether the clause is unusual
(`docs/adr/0004`). Severity ranks by how badly and how irreversibly the clause
can hurt this user, not by how common it is.

The engine calls its language model through OpenRouter with a pinned model
(`docs/adr/0002`). Callers and tests inject the model client; the engine itself
is deterministic given fixed model output.

## User Stories

1. As the target user, I want a plain-English summary of the whole contract, so
   that I understand what I am about to sign without reading legalese.
2. As the target user, I want the clauses that could hurt me pulled out and
   listed, so that I know what to focus on.
3. As the target user, I want each flagged clause shown next to the exact
   sentence it came from, so that I can read the original words and confirm the
   tool is not making it up.
4. As the target user, I want the flags ordered by how badly the clause could
   hurt me, so that I deal with the worst thing first.
5. As the target user, I want an assignment of my pre-existing IP or my general
   tools flagged as severe, so that I do not sign away things that were never
   part of this job.
6. As the target user, I want an assignment that takes effect before I am paid
   flagged as severe, so that I do not hand over the work and then have no
   leverage to get paid.
7. As the target user, I want a grab of my moral rights or my right to show the
   work in my portfolio flagged as severe, so that I keep the parts of the work
   that matter to my career.
8. As the target user, I want an uncapped liability or a broad indemnification
   flagged as severe, so that I understand I could be personally on the hook for
   the client's losses with no ceiling.
9. As the target user, I want a termination-for-convenience clause that does not
   pay me for work already done flagged as high, so that I know the client can
   turn my booked project into a free option.
10. As the target user, I want payment terms that delay or gate my payment —
    approval-gated pay with acceptance undefined, net-60/90, late-invoked kill
    fees — flagged as high, so that I can push for terms that actually pay me.
11. As the target user, I want non-compete, exclusivity, and non-solicit clauses
    flagged as moderate, so that I notice the contract quietly narrowing my
    business.
12. As the target user, I want a unilateral-amendment clause flagged as moderate,
    so that I know the deal I sign is not the deal I stay bound to.
13. As the target user, I want a standard work-for-hire assignment of the
    commissioned deliverable shown as context and marked normal, not flagged red,
    so that I can tell the difference between an ordinary term and a predatory
    one.
14. As the target user, I want a standard clause that is nonetheless one-sided
    against me to still be flagged, so that "this is common" is not used as a
    reason to stay silent.
15. As the target user, I want an unusual clause that does not actually hurt me
    left unflagged, so that the tool is not just a weirdness detector.
16. As the target user, I want the tool to tell me plainly what a clause does and
    to ask me a direct question where it is unsure, rather than hedging, so that
    I can act on what it says.
17. As the target user, I want the tool to name the protections this contract is
    missing — a liability cap, a payment deadline with a consequence, a carve-out
    for my pre-existing IP, a kill fee, a defined acceptance window — so that I
    know what to ask to have *added*, not just what to change.
18. As the target user, I want the "missing protections" list kept visually and
    verbally separate from the flags, so that I understand it is a different kind
    of claim with different evidence behind it.
19. As the target user, when my contract is genuinely fine, I want the tool to
    say so and show me what it checked, so that a clean result is believable and
    not just an empty screen.
20. As the target user, I never want the tool to invent a problem so it has
    something to show, so that I keep trusting its flags.
21. As the target user, I want to give the tool my own red lines — rules like "no
    assignment of IP before payment clears" — and have every contract checked
    against them, so that the analysis reflects what *I* will not accept, not
    just the built-in checks.
22. As the target user, when a clause hits one of my red lines, I want that flag
    surfaced and marked as hitting my red line, even if the built-in severity
    would have buried it, so that my own non-negotiables are never missed.
23. As the target user, I want the same contract to give me the same analysis
    every time I run it, so that I can trust the result is not a coin flip.
24. As the target user, I want the tool to work on a contract that does not look
    like a standard template, so that an unusual format does not make it fail
    silently.
25. As a developer, I want the analysis reachable through a single function that
    takes document text and red lines and returns a Report, so that the engine
    can be tested and reused without a UI or a database.
26. As a developer, I want a standalone function that checks whether a source
    sentence appears verbatim in the document, so that the citation guarantee can
    be tested in isolation.
27. As a developer, I want the model client injected, so that tests run against
    recorded model output and never make a live call.
28. As a developer, I want a flag whose source sentence does not appear verbatim
    in the document to be dropped before the Report is returned, and the drop
    counted, so that the citation guarantee holds even when the model
    paraphrases.
29. As a developer, I want the engine's own prose scanned for hedge words with
    the quoted source sentences excluded, so that the direct-voice rule is
    enforced and not just hoped for.
30. As a reviewer, I want the clause library and the protection checklist to be
    data I can read and argue with, so that the opinion baked into "dangerous"
    and "missing" is visible and correctable.
31. As a reviewer, I want a set of annotated fixture contracts the engine is
    tested against, so that recall and false-flag behaviour can be measured now
    and reused by the eval harness later.

## Implementation Decisions

### Modules

- **The analyzer.** One entry point: takes `{ documentText, redLines }` and
  returns a `Report` (async — it calls the model). All prompt construction, model
  interaction, clause matching, severity assignment, citation enforcement, and
  the missing-protection checklist live behind this boundary.
- **The citation verifier.** A pure function: takes a candidate source sentence
  and the document text, returns whether the sentence appears in the document
  **verbatim after whitespace normalisation** — collapse runs of whitespace
  (including newlines) to a single space and trim ends; compare
  character-for-character otherwise, including punctuation and case. No fuzzy
  matching. Used by the analyzer; testable alone (this is the second seam,
  confirmed with the user).
- **The model client.** An interface with one operation — send a prompt, get a
  completion — with an OpenRouter-backed implementation. Injected into the
  analyzer. Tests supply a fake that returns recorded output.
- **The clause library and the protection checklist.** Read-only data, not code:
  the clause categories the analyzer recognises (with their default severity and
  the asymmetry-test rationale for each), and the freelancer-protection checklist
  used by the "Not in this contract" section. Structured so a non-engineer can
  review them.

### The Report contract

- **summary**: plain-English text covering the whole document.
- **flags**: ordered most-severe-first. Each flag has: the **source sentence**
  (verbatim substring of `documentText` per the verifier); a **severity** of
  `severe` / `high` / `moderate`; a **category** from the clause library; an
  **explanation** in Redline's own voice (see voice rule); and **hitsRedLine** —
  the id of the user red line this clause triggers, or null.
- **contextNotes**: clauses that are standard and not flagged (e.g. a plain
  work-for-hire assignment of the deliverable), each with its source sentence, a
  category, and a short "this is normal" note. Shown, not flagged
  (`docs/adr/0004` §Consequences).
- **notInContract**: one entry per checklist protection, each with the protection
  key, a status of `present` / `absent` / `partial`, and a note in Redline's
  voice. For `absent`, the note says what is missing and why it matters. This
  list is **exempt from the source-sentence rule** (`docs/adr/0006`); entries do
  not carry a source sentence even when one exists.
- **clean**: true when `flags` is empty. When true, the summary and
  `checksRun` still populate; the Report must not contain invented flags to avoid
  a bare clean result.
- **checksRun**: the list of checks performed (clause categories looked for,
  checklist protections examined), for the clean result to show its work
  (`docs/adr/0005`).
- **droppedFlagCount**: how many model-proposed flags were removed because their
  source sentence failed verification. For observability; not user-facing.

### Severity

- Ranked by harm and irreversibility to the target user, not by frequency or
  complaint volume (`docs/adr/0004`).
- The sharp edges of IP assignment and uncapped liability / broad indemnification
  are `severe`. Termination-for-convenience-without-payment and payment-timing
  clauses are `high`. Non-compete / exclusivity / non-solicit and
  unilateral-amendment are `moderate`. A plain work-for-hire assignment of the
  commissioned deliverable is not a flag — it is a context note.
- A flag that sets **hitsRedLine** is always included in `flags` and never
  dropped for being low-severity; its severity is raised to at least `high` so a
  red-line hit is never below the fold. The user's red lines override the
  built-in ranking for visibility (`docs/adr/0004`, and PRD §4 gap noted in
  session).

### Flag selection — the asymmetry test

- A clause is flagged when it fails the asymmetry test (`docs/adr/0004`): it lets
  the counterparty act on the user with no reciprocal right, no cap, or no cure
  period, beyond what the deal structure justifies. "Unusual" alone is not a
  reason to flag; "standard" alone is not a reason to stay silent.
- Applying the test is a judgment the model makes. The document's words remain
  the only evidence — every flag still cites its source sentence — but the
  judgment that the asymmetry is unjustified is Redline's, and the explanation
  reads as Redline's judgment, not as a quote from the document
  (`docs/adr/0004`, `CLAUDE.md` Rules).

### Citation integrity (`docs/adr/0001`)

- Before the Report is returned, every flag's source sentence is checked with the
  verifier against `documentText`. A flag that fails is removed from the Report
  entirely and counted in `droppedFlagCount`. There is no "source unverified"
  state.
- Dropping a real risk because its sentence could not be verified is an accepted
  cost. Showing an unverifiable flag is not.

### Voice (`docs/adr/0005`)

- Each flag explanation and each `notInContract` note is a statement or a
  direct question — never a hedge. The engine's own prose (everything except the
  quoted source sentences) must contain no hedge words: "may", "might", "could be
  seen as", "potentially", "arguably". This is enforced, not just prompted: the
  analyzer scans its assembled prose with the source-sentence spans removed and
  treats a hedge word as a failure to correct before returning.
- The bias is toward flagging: given a citable sentence and a marginal call, the
  engine flags rather than stays silent (`docs/adr/0005`).

### Model interaction (`docs/adr/0002`)

- Calls go through OpenRouter to a pinned provider + model + version from config.
  No "auto" routing. Temperature at the lowest setting that still produces usable
  output, so that repeated runs on the same input match.
- Prompt/response logging is disabled and a zero-retention setting selected. If
  that cannot be guaranteed for the chosen model, the model choice is reopened
  (`docs/adr/0002`).
- The analyzer is deterministic given fixed model output: any ordering,
  de-duplication, severity assignment, and citation enforcement it does must not
  depend on wall-clock, map iteration order, or randomness.

### Red lines

- `redLines` is a list of `{ id, text }`. The engine checks each red line against
  the document. When a clause matches a red line, that clause's flag carries the
  red line's id in `hitsRedLine` and follows the visibility rule above.
- An empty `redLines` list is normal and changes nothing except that no flag sets
  `hitsRedLine`.

## Testing Decisions

### What a good test looks like

- Tests assert on **external behaviour only**: feed `documentText` (and
  `redLines`), assert on the returned `Report`. Do not assert on prompt strings,
  the number of model calls, internal clause-matching structures, or private
  helpers.
- The model is always faked in tests. A test controls the model's output and then
  checks what the analyzer does with it — orders it, drops uncitable flags,
  strips hedges, assembles the Report.

### Seams under test

1. **The analyzer** — `analyze({ documentText, redLines })` with a fake model
   client. The primary seam. Covers: flag presence and absence, severity
   ordering, source-sentence correctness, context notes vs flags, the
   "Not in this contract" list, the clean result, red-line hits, determinism,
   and the hedge-word rule.
2. **The citation verifier** — the pure function alone. Covers: exact match,
   whitespace/newline normalisation, punctuation and case sensitivity, a
   near-miss paraphrase returning false, a sentence spanning a line break in the
   source returning true.

### Cases the fixture set must cover

- One annotated freelance agreement per clause category in PRD §5, with the
  clause's expected severity.
- A contract a competent reviewer judged fair → `clean` is true, no flags,
  `checksRun` populated.
- A standard-but-one-sided clause → flagged (frequency is not a defence).
- An unusual-but-harmless clause → not flagged.
- A contract missing each checklist protection → the matching `notInContract`
  entry is `absent`; a contract that includes that protection in unusual wording
  → not reported `absent`.
- A clause that matches a supplied red line → flag sets `hitsRedLine` and is
  surfaced at `high` or above.
- A faked model response with a paraphrased (non-verbatim) quote → that flag is
  absent from the Report and `droppedFlagCount` reflects it.
- The same fixture + fixed model output run five times → identical Report.

### Prior art

None in this repo — it is greenfield. This ticket establishes the fixture format
and the fake-model pattern. PRD §4 ("What good looks like") is the acceptance
specification; the recall and false-flag thresholds are set against this fixture
set once it exists. The future eval-harness ticket reuses these fixtures rather
than inventing its own.

## Out of Scope

- **The ingest path** — file upload, in-browser PDF/DOCX parsing, text
  extraction, and storing only the extracted text. The engine takes text that is
  already extracted. Separate ticket.
- **Counter-offers** (PRD capability 3) — drafting a replacement clause per flag.
  Separate ticket; it will consume the Report.
- **The question box** (capability 4).
- **The red-lines editing UI** (capability 5) — the engine consumes red lines;
  creating and editing them is UI and persistence.
- **The saved library** (capability 6).
- **The eval harness and scoring** for PRD §4 — this ticket produces fixtures the
  harness will use, not the harness.
- **Any rendering of the Report** — visual treatment of severity, the visual
  separation of "Not in this contract" from flags, and the clean-result screen
  are described here as behaviour but built in the UI ticket.
- **Auth, sessions, and persistence** beyond what `analyze` needs as inputs.
- **OCR** and **lease-tuned analysis** — excluded by `CLAUDE.md` and
  `docs/adr/0003` respectively; not revisited here.

## Further Notes

- **Unresolved upstream (`docs/adr/0005`).** "Prefer the false flag" is a flat
  rule, and it pulls against keeping the clean result believable. The engine
  implements the flat rule and reports `clean` honestly; how the UI keeps a
  clean result meaningful under an over-flagging engine is a design question for
  a later ticket, not this one.
- **The clause library and protection checklist carry an opinion** about what a
  fair freelance contract contains (`docs/adr/0004`, `docs/adr/0006`). This
  ticket builds the mechanism and a defensible starter set; a competent reviewer
  should pass over the starter set before it is treated as settled.
- **The `notInContract` section is the defined exception to `docs/adr/0001`.**
  Its entries assert absence and cannot cite. Anything that reads as a cited
  risk belongs in `flags`, not here.
- Domain terms used above — flag, source sentence, red line, heuristic, asymmetry
  test, dangerous vs unusual, silent risk, "Not in this contract", clean result,
  target user — are defined in `CONTEXT.md`.
