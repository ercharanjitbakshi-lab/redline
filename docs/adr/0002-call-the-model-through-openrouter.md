# 0002 — Call the model through OpenRouter

Date: 2026-08-29 · Status: Accepted

## Decision

Redline calls its language model through OpenRouter, not through the Anthropic or
OpenAI APIs directly. The pipeline talks to one endpoint with one key. The
specific model is a pinned configuration value — provider, model, and version —
not a code dependency, and not OpenRouter's "auto" routing.

## Why

- The model choice is not settled and should not be. We expect to move to
  whichever model gives the best accuracy-per-dollar as prices and releases
  change, and we want that to be a config edit, not a vendor migration. The
  research (`research/summary.md` §4) puts the validated self-serve price at
  ~$1–3 per document against work that needs a frontier model over long
  documents — the pressure to switch models will be real.
- One integration, one key, one bill, instead of a separate SDK, account, and
  credential per provider.
- Nothing in this version is a bet on a particular model vendor. The thing we are
  proving is that the analysis is trustworthy (ADR 0001); the model behind it is
  swappable.

## Alternatives

- **Call Anthropic or OpenAI directly.** Best latency and earliest access to new
  features, but it couples the pipeline to one vendor's API during the exact
  phase where we want model selection to stay loose. Rejected for now.
- **Build a thin provider abstraction over two or three direct integrations.**
  Same flexibility with no middleman margin, but it is code we own and maintain
  to serve a model thesis we don't have. Rejected.
- **Use a framework router (Vercel AI SDK provider layer, self-hosted LiteLLM).**
  Plausible given we are on Next.js, but adds a dependency and still needs
  per-provider keys. Revisit only if OpenRouter itself becomes the problem.

## Consequences

- OpenRouter is a third party that sees uploaded document text. The "only
  extracted text is stored, never the original file" rule extends to it:
  prompt/response logging must be disabled and a zero-retention setting selected.
  If that cannot be guaranteed, this decision is reopened.
- `.env.local` carries `OPENROUTER_API_KEY` and no other provider key.
- The model id is pinned in config. No "auto" routing — the citation guarantee in
  ADR 0001 needs output we can reason about.
- An OpenRouter outage is a full outage. Configure provider fallbacks if uptime
  becomes a concern.
- Small latency and margin overhead versus calling a provider directly. Accepted.
