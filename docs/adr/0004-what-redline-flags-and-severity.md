# 0004 — What Redline flags, and how severity is assigned

Date: 2026-08-29 · Status: Accepted

Relates to: ADR 0001 (every flag cites its source sentence), ADR 0003 (the target
user), ADR 0006 (silent risks).

## Decision

**A clause is flagged when it fails the asymmetry test:** it lets the other party
act on the user with no reciprocal right, no cap, or no cure period — *beyond
what the deal structure justifies*. Redline flags **danger, not unusualness**. A
standard clause can be dangerous; an unusual clause can be harmless. "This is
uncommon" is never, on its own, a reason to flag.

**Severity ranks by harm to the target user**, not by how often the clause type
draws complaints (which is how `research/summary.md` §2 ranks).

**At the top of the severity list: the sharp edges of IP assignment** —
assignment of the freelancer's pre-existing IP or general tools, assignment that
vests before payment clears, and grabs of moral or portfolio rights. A plain
work-for-hire assignment of the commissioned deliverable is **not** top-severity.

**Uncapped liability and broad indemnification are treated as first-class,
existential risks**, ahead of what the complaint data alone would justify. Much
of this is a silent risk — see ADR 0006.

## Why

- The target user (ADR 0003) is pre-signing with leverage. What matters to them
  is not "is this weird" but "what can this clause do to me, and can I undo it."
  The asymmetry test encodes that question directly.
- Ranking by complaint volume would put payment-timing clauses first because
  they're common. But a late payment is usually recoverable; an assignment of
  pre-existing IP is not, and it compounds. Severity should track how badly and
  how irreversibly a clause can hurt this user.
- Flagging every IP assignment red would make the most common clause in a
  freelance contract always red, and users would learn to ignore red. Severity
  attaches to the edges that are actually predatory.
- Uncapped liability can end a freelancer's finances. The research rates it only
  "weak-to-moderate" on evidence because people don't post online after a
  catastrophe, not because it is rare or mild. We are ranking on reasoning here,
  and saying so.

## Alternatives

- **Flag by deviation from market norm.** Easy to explain ("unusual for a
  contract like this") and easy to defend. Rejected: it flags harmless weirdness
  and stays silent on net-90 and forced arbitration because they are normal.
- **Flag on both axes — "unusual" and "one-sided" as separate tags.** More
  honest, but it pushes two-dimensional interpretation onto the user and doubles
  the UI. Rejected for v1; revisit if the single signal proves too blunt.
- **Rank severity strictly by the research's evidence table.** Stays close to
  data, but misses the low-frequency, high-severity clause that wipes someone
  out. Rejected.

## Consequences

- The model exercises judgment: deciding whether an asymmetry is "beyond what the
  deal structure justifies" is not a mechanical rule. This is a deliberate
  carve-out against `CLAUDE.md`'s "state only what the document says." The
  document's words remain the only *evidence* — every flag still cites its
  source sentence per ADR 0001 — but the *judgment* that the clause is dangerous
  is Redline's, and the output should read that way (ADR 0005).
- The clause library and severity model need a defined list of the sharp IP
  edges, the cure/cap/reciprocity checks, and the liability/indemnity patterns.
  That list is a maintained artefact, not a prompt written once.
- Because severity is judgment, two runs could rank the same contract slightly
  differently. The pinned model (ADR 0002) limits this; tests should check
  severity ordering is stable for a fixed set of fixtures.
- Vanilla work-for-hire assignment still appears in the report — as context, not
  as a top flag — so a user who doesn't know that's normal isn't left guessing.
