# 03: Model client — interface, fake, and OpenRouter implementation

**What to build:** The injectable seam between the analyzer and the language
model (`docs/adr/0002`). A single-operation interface — send a prompt, get a
completion — with two implementations:

- **Fake**, for tests: returns pre-recorded/programmed output, never makes a
  network call.
- **OpenRouter-backed**, for real use: calls a pinned provider + model +
  version from config (no "auto" routing), at the lowest temperature setting
  that still produces usable output, with prompt/response logging disabled
  and a zero-retention setting selected. If zero-retention cannot be
  guaranteed for the configured model, that is a blocking configuration
  error, not a silent fallback.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The interface has exactly one operation (send prompt → get completion)
      and no OpenRouter- or provider-specific types leak through it.
- [x] The fake client is usable in tests with zero setup beyond programming
      its return value(s), and never makes a network call.
- [x] The real client reads provider, model, and version from config — never
      "auto" routing — and refuses to start if zero-retention cannot be
      confirmed for that model.
- [x] The real client is verified against a live OpenRouter call (manual or
      integration-gated) to confirm request shape, auth, and response
      parsing work end to end.
- [x] Temperature is set to the lowest value that still produces usable
      output, and is a config value, not hardcoded inline per call site.

## Comments

Implemented in `lib/model/`: `client.ts` (interface), `fake.ts`,
`openrouter.ts`, `config.ts` (the pin). Tests in `model.test.ts`; live check
in `openrouter.live.ts`, run with `npm run test:live` (not part of `npm test`).

- Pinned: `anthropic/claude-sonnet-5`, version `20260630`, endpoint
  `amazon-bedrock/eu-west-1` (user's choice: Sonnet 5, EU).
- Zero retention: checked at startup against
  `https://openrouter.ai/api/v1/endpoints/zdr` (model, version and endpoint
  must all match, or the client throws), and enforced per request with
  `provider.zdr: true`, `only: [endpoint]`, `allow_fallbacks: false`,
  `data_collection: "deny"`. Account-level: ZDR-only on and I/O logging off
  in OpenRouter Settings → Privacy (set by the user).
- Temperature: Sonnet 5 accepts none on any provider, so config holds `null`
  and the request omits it. `require_parameters: true` makes a future
  unsupported setting fail instead of being silently dropped.
- Live check passed 2026-09-26: served by Amazon Bedrock. The response's
  `model` field carries no date (`anthropic/claude-sonnet-5`), so the version
  pin rests on the startup ZDR check, not on the response.
- Output cut off at the token limit throws, so a half quote never reaches
  the citation verifier.
