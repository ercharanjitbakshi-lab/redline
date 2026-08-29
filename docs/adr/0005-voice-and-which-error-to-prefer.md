# 0005 — Voice, and which error to prefer

Date: 2026-08-29 · Status: Accepted

Relates to: ADR 0001 (citation guarantee), ADR 0004 (what gets flagged).

## Decision

**Preferred error: the false flag.** Given a citable sentence and a marginal
call, Redline flags rather than stays silent. This is a flat rule across
severities.

**Confidence voice: direct about what the text says, explicit and specific about
what it does not know.** Every flag is either a clear statement or a clear
question — never a hedge.

> This clause assigns all IP in the deliverables to the client on signing. It
> does not tie the assignment to payment. If you want the rights to transfer only
> once you're paid, ask for that.

Not: "This clause may potentially be of some concern depending on
circumstances."

**The clean document gets a real answer.** When nothing is worth flagging,
Redline says so plainly — "Nothing here needs your attention" — and shows the
specific checks it ran and passed. "Clean" is evidenced, not an empty screen.

## Why

- The target user (ADR 0003) won't catch these clauses themselves — that's the
  point of the product. The downside is asymmetric: acting on one false flag
  costs a little negotiating capital; missing an uncapped-indemnity clause can
  cost the user everything. When in doubt, flag.
- Hedged language is safe for us and useless for the user. It is the exact
  register — "notwithstanding the foregoing, such provision may be construed" —
  that the user came to Redline to escape. A tool that hedges everything can't be
  told apart from one that's guessing.
- A confident statement is worth more, but a confident statement that's wrong is
  worse from a product whose whole pitch is trust. The mitigation is not to
  hedge; it's to be confident only about what the text *says* and to turn
  everything else into a specific, answerable question.
- A tool that always finds problems stops being believed (`research/summary.md`
  §3, §5). A clean result has to be a first-class output, and it has to show its
  work, or users will read the green as "the tool didn't try."

## Alternatives

- **Prefer the miss** — keep flags rare and high-confidence so each is believed.
  Rejected: it means consciously shipping a tool that stays quiet on real risks
  it wasn't sure how to phrase, for users who won't catch them otherwise.
- **Tune the error preference per severity** — over-flag existential clauses,
  under-flag annoyances. Considered and rejected by the user: it loads the
  accuracy burden onto the severity model, which is the least-tested part. Left
  as a flat rule.
- **Hedge when unsure / attach a confidence score to each flag.** Rejected: users
  anchor on the qualifier instead of the content, and "low confidence" flags get
  ignored exactly like hedges.
- **Clean result as a bare "no issues found."** Rejected: indistinguishable from
  failure.

## Consequences

- **Open question, deliberately unresolved here:** a flat "prefer the false flag"
  makes clean results rarer, which pulls against keeping the clean result
  believable, which pulls against the whole trust positioning. This ADR does not
  settle how the UI holds over-flagging and a meaningful clean result at once —
  that is for the PRD. Flagged so it is not forgotten.
- Relationship to ADR 0001: no contradiction. ADR 0001 governs whether a flag
  *can* be shown (is there a source sentence). This ADR governs what to do when
  it can — lean toward showing it. A risk with no citable sentence is still
  dropped from the flags section (and may surface via ADR 0006 instead).
- The prompt and the UI copy need a style rule: no "may", "might", "could be
  seen as", "potentially". Statements or questions only. Tests should scan output
  for hedge words.
- The clean result needs its checklist of "what was checked" defined — it draws
  on the same clause library as ADR 0004 and the protection checklist as ADR
  0006.
