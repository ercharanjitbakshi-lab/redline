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

**Status:** ready-for-agent

- [ ] The interface has exactly one operation (send prompt → get completion)
      and no OpenRouter- or provider-specific types leak through it.
- [ ] The fake client is usable in tests with zero setup beyond programming
      its return value(s), and never makes a network call.
- [ ] The real client reads provider, model, and version from config — never
      "auto" routing — and refuses to start if zero-retention cannot be
      confirmed for that model.
- [ ] The real client is verified against a live OpenRouter call (manual or
      integration-gated) to confirm request shape, auth, and response
      parsing work end to end.
- [ ] Temperature is set to the lowest value that still produces usable
      output, and is a config value, not hardcoded inline per call site.
