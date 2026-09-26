# 02: Forgot-password flow

**What to build:** Password reset by email. Sign-in is email and password
through Supabase (`app/login/`), with no way to recover a forgotten password.
Needs a "Forgot password?" link on `/login`, a request form, a landing route for
the reset link (the confirmation route `app/auth/confirm/route.ts` already
handles `code` and `token_hash` links), and a set-new-password form. The reset
URL has to be in Supabase → Authentication → URL Configuration → Redirect URLs.

**Blocked by:** None

**Status:** needs-triage

- [ ] A user can request a reset email from `/login`.
- [ ] The link lets them set a new password and signs them in.
- [ ] All new copy passes through the humanizer.
