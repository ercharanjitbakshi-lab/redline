# 0007 — Pin Claude Sonnet 5 on Bedrock EU, with no temperature

Date: 2026-09-26 · Status: Accepted

Relates to: ADR 0002 (call the model through OpenRouter), ADR 0004 (severity is
judgment).

## Decision

The analysis engine uses `anthropic/claude-sonnet-5`, version `20260630`, served
only by the `amazon-bedrock/eu-west-1` endpoint through OpenRouter. The pin lives
in `lib/model/config.ts`. No temperature is sent: Claude Sonnet 5 accepts none on
any provider.

## Why

- Cost against accuracy. On OpenRouter's zero-retention pricing (2026-09-26), a
  20-page contract costs about $0.20 with Sonnet 5 and about $0.40 with Opus 5.5.
  Opus was the recommended option; the user chose Sonnet. On the annotated
  fixtures Sonnet 5 matched every annotation: the six flags and their
  severities, all fifteen protection verdicts across three contracts, two
  plain-English red lines (and no false hit on a third), and the marginal net-45
  call ADR 0005 says to flag.
- EU region: the user's choice.
- Zero retention is checked, not assumed. At startup the client refuses to run
  unless this exact model, version and endpoint are on OpenRouter's list at
  `/api/v1/endpoints/zdr`. Every request also sends `zdr: true`, `only:
  [endpoint]` and `allow_fallbacks: false`.

## Alternatives

- **Claude Opus 5.5.** Most capable, twice the cost. Revisit if real contracts
  show misses the fixtures did not.
- **GPT-5.5 via Azure.** About $0.55 per contract, the priciest.
- **Claude Haiku 4.5.** About $0.10, weakest on long, careful legal reading.
- **US region.** Equally available with zero retention; not chosen.

## Consequences

- The spec's "temperature at the lowest setting that still produces usable
  output" cannot be met with this model. Consistency between runs rests on the
  pinned model and version. Ordering, severity and citation checks happen in
  code, so only the model's judgment varies between runs.
- OpenRouter's response names the model but not its version date, so the
  version pin is verified at startup (against the zero-retention list), not
  per response.
- `require_parameters: true` is sent, so a future config that adds a
  temperature fails loudly on a model that ignores it instead of silently
  dropping it.
- The OpenRouter account's privacy settings (zero-retention endpoints only,
  input/output logging off) were set by the user in the dashboard. Code does
  not enforce them; the per-request `zdr` flag does.
