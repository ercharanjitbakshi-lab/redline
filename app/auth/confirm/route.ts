import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The confirmation link in the sign-up email lands here. Supabase sends
// either a `code` (the default email template) or a `token_hash` (a custom
// template); both end with a session cookie set on this response.
//
// A `code` can only be exchanged in the browser that signed up, because
// that browser holds the PKCE verifier cookie. Supabase has already
// confirmed the email by the time it redirects here, so when the link is
// opened on another device or browser, the account is confirmed and the
// user just needs to sign in.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let destination = "/login?confirm=failed";

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) destination = "/documents";
    else if (error.code === "pkce_code_verifier_not_found") destination = "/login?confirm=done";
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) destination = "/documents";
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
