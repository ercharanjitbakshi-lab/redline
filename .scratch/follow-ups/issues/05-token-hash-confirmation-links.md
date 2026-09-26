# 05: Confirmation emails that sign you in on any device

**What to build:** Switch Supabase's "Confirm signup" email template to a
`token_hash` link, e.g.
`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`. Today the default
template sends a `code` link, which only completes sign-in in the browser that
signed up (it holds the PKCE verifier cookie). Opened elsewhere, the user is
told their email is confirmed and asked to sign in. `app/auth/confirm/route.ts`
already handles `token_hash`, so this is a dashboard change plus a test on a
second device.

**Blocked by:** None

**Status:** needs-triage

- [ ] Clicking the confirmation link on a different device lands the user on
      `/documents`, signed in.
