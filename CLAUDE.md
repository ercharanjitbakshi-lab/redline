# Redline

A web app: upload a contract, lease, freelance agreement, or ToS and get back
an analysis the user can trust. This version exists to prove the analysis is
trustworthy — nothing else earns priority over that.

## Stack (settled — do not reconsider)

- Next.js, deployed on Vercel.
- Supabase for auth and database.
- The model is called through OpenRouter. Not the OpenAI or Anthropic APIs directly.
- The uploaded file is parsed in the browser. Only the extracted text is stored — never the original file.

## Capabilities to build (build these, then stop)

1. Plain-English summary of the document.
2. Clauses that could hurt the user, ranked by severity, each showing the exact source sentence.
3. A drafted counter-offer for each flagged clause.
4. A question box that answers only from the document.
5. An editable list of the user's own red lines that drives the analysis.
6. A saved library of the user's past documents.

If a step looks obvious but is not on this list, ask before doing it.

## Excluded on purpose (do not build; do not propose)

- Payments and billing.
- Sharing a document between users.
- OCR for scanned documents. A citation is worthless if the text it points at was
  misread, so OCR would actively undermine the thing this version is proving.

## Rules

- Every risk flag cites the exact sentence it came from. A flag whose source
  sentence cannot be shown is a bug, not a degraded result.
- State only what the document says. Where the text does not support a claim,
  the product does not make it.
- Credentials live in `.env.local` (gitignored). Never commit a secret — a
  pushed key is public and must be rotated.
- Ask before adding any dependency.

## Read before you act

- `research/summary.md` — the user research. Read it before deciding what the product should do.
- `PRD.md` — the brief. Does not exist yet; read it before building once it does.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
