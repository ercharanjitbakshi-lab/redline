# Redline

A web app for a freelancer reviewing an agreement before signing it: upload the
contract (a PDF or DOCX) and get back an analysis the user can trust, and a
counter-offer they can send. This version exists to prove the analysis is
trustworthy — nothing else earns priority over that. See `docs/adr/0003` for who
this is and isn't for.

## Stack (settled — do not reconsider)

- Next.js, deployed on Vercel.
- Supabase for auth and database.
- The model is called through OpenRouter. Not the OpenAI or Anthropic APIs directly.
- The uploaded file is parsed in the browser. Only the extracted text is stored — never the original file.

## Capabilities to build (build these, then stop)

1. Plain-English summary of the document.
2. Clauses that could hurt the user — flagged for danger, not for being unusual
   (`docs/adr/0004`) — ranked by severity, each showing the exact source sentence.
3. A drafted counter-offer for each flagged clause.
4. A question box that answers only from the document.
5. An editable list of the user's own red lines that drives the analysis.
6. A saved library of the user's past documents.
7. A "Not in this contract" section listing absent protections the freelancer
   should have (`docs/adr/0006`). Kept visually distinct from the flags.

If a step looks obvious but is not on this list, ask before doing it.

## Excluded on purpose (do not build; do not propose)

- Payments and billing.
- Sharing a document between users.
- Serving consumers reviewing terms of service or subscription/auto-renewal
  terms. Best-evidenced pain in the research, deliberately out (`docs/adr/0003`).
- OCR for scanned documents. A citation is worthless if the text it points at was
  misread, so OCR would actively undermine the thing this version is proving.

## Rules

- Every risk flag cites the exact sentence it came from. A flag whose source
  sentence cannot be shown is a bug, not a degraded result. Scoped to flags; the
  "Not in this contract" section is the defined exception (`docs/adr/0006`).
- State what the document says, and name what it doesn't. Two judgments are
  Redline's own and must read that way: whether a clause's asymmetry is
  unjustified (`docs/adr/0004`), and whether a protection is missing
  (`docs/adr/0006`). Everything else stays with the text.
- Credentials live in `.env.local` (gitignored). Never commit a secret — a
  pushed key is public and must be rotated.
- Ask before adding any dependency.

## Read before you act

- `CONTEXT.md` and `docs/adr/` — the vocabulary and the decisions. Read before
  deciding anything about what the product does.
- `research/summary.md` — the user research. Read it before deciding what the product should do.
- `PRD.md` — the brief for the first version, written against the research. Read it before building.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
