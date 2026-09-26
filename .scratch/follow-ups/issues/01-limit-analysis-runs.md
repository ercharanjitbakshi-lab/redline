# 01: Limit how often a user can run the analysis

**What to build:** A cap on analysis runs. Each click of "Analyze this contract"
or "Run the analysis again" calls the pinned model (`docs/adr/0007`) and costs
about $0.20 of OpenRouter credit, and nothing stops a signed-in user clicking
repeatedly. The server action is `analyzeDocument` in
`app/documents/[id]/actions.ts`; every run is a row in `analyses`, so recent runs
per user can be counted from there.

Open questions: the limit (per document? per user per day?), and the copy shown
when it is hit (must go through the humanizer).

**Blocked by:** None

**Status:** needs-triage

- [ ] A user over the limit gets a clear message instead of a model call.
- [ ] The check runs on the server, inside the action, not only in the UI.
