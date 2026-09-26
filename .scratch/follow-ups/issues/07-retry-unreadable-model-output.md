# 07: Retry once when the model's answer can't be read

**What to build:** One automatic retry in `analyze()` (`lib/analysis/analyze.ts`)
when the model's reply can't be parsed, or leaves a checklist protection
unanswered. Today either case fails the whole analysis. That is deliberate:
garbage must never become an empty, clean-looking Report, and a missing
protection must never default to "absent". A retry keeps that rule and spares
the user a failed run. It costs a second model call, so it happens once only.

**Blocked by:** None

**Status:** needs-triage

- [ ] An unreadable first reply followed by a good one returns a normal Report.
- [ ] Two unreadable replies still fail; nothing turns into a clean result.
- [ ] Tested with the fake model client.
