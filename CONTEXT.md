# Context

Domain vocabulary for Redline. Use these terms exactly as defined here; don't
drift to synonyms. When a decision stands behind a term, the ADR is named.

The decisions themselves live in `docs/adr/`. Start with 0001 (the citation
guarantee) and 0003 (who the product is for).

## Glossary

### Target user

The freelancer who negotiates: an independent contractor reviewing an agreement
**before signing**, who will push back on terms. Their workflow (recurring short
contracts), document types (services / SOW / IP / brand-deal agreements), and
leverage (can still change the deal) are the design centre. Not all freelancers —
the ones who will act. Explicitly **not** consumers reviewing SaaS terms of
service or subscription auto-renewal. See ADR 0003.

### Flag

A single clause Redline identifies as potentially harmful to the target user,
carrying a severity and its verbatim source sentence. A flag is a claim about
text that is present in the document. See ADR 0001, ADR 0004.

### Source sentence

The exact, verbatim sentence from the uploaded document that a flag is derived
from. It is carried with the flag through the whole pipeline and shown next to
it. A flag whose source sentence cannot be produced is not shown — that is a bug,
not a degraded result. See ADR 0001.

### Counter-offer

A drafted replacement clause for a flagged clause, written for the user to send
back to the other party. The counter-offer presupposes the user can still
negotiate, which is why the product targets the pre-signing moment. See ADR 0003.

### Red line

A rule the user sets in advance — e.g. "no assignment of IP before payment
clears" — that Redline checks every uploaded document against. Red lines are
per-user and they drive the analysis. Distinct from a heuristic, which is
built in and applies to everyone.

### Heuristic (built-in check)

A risk check Redline applies to every document regardless of who uploaded it.
Contrast with a red line, which is user-supplied and per-user.

### Asymmetry test

The test that decides whether a clause is flagged: does it let the other party
act on the user with no reciprocal right, no cap, or no cure period — *beyond
what the deal structure justifies*? Redline flags **danger, not unusualness**.
Applying the test is a judgment the model makes; the document's words remain the
only evidence for it. See ADR 0004.

### Dangerous vs unusual

Redline flags danger (asymmetry and downside to the user), not deviation from
market norm. A standard clause can be dangerous; an unusual clause can be
harmless. "This is uncommon" is not, by itself, a reason to flag.

### Silent risk

A risk that arises from what the contract does **not** say — no liability cap, no
payment deadline, no carve-out for the freelancer's pre-existing IP. A silent
risk carries no source sentence, so it cannot be a flag. See ADR 0006.

### "Not in this contract"

The separate, walled-off section of the report that lists absent protections a
freelancer should have, driven by a fixed checklist. It makes claims about
absence and is exempt from the source-sentence rule — and is therefore kept
visually and verbally distinct from flags so the two are never confused. See
ADR 0006.

### Clean result

The output for a document with nothing worth flagging: a plain statement that
nothing needs the user's attention, together with the specific checks that were
run and passed — so "clean" is evidenced, not an empty screen. See ADR 0005.
