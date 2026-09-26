"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string } | undefined;

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirm your email first. The link is in your inbox." };
    }
    if (error.code === "invalid_credentials") {
      return { error: "That email and password don't match an account." };
    }
    return { error: "We couldn't sign you in. Try again in a minute." };
  }

  redirect("/documents");
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = credentials(formData);
  if (!email || !password) return { error: "Enter an email and a password." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "There's already an account with that email. Sign in instead." };
    }
    if (error.code === "weak_password") {
      return { error: "Pick a stronger password." };
    }
    return { error: "We couldn't create your account. Try again in a minute." };
  }

  // With email confirmation on, Supabase returns no session until the
  // user clicks the link.
  if (!data.session) {
    return { notice: `We sent a link to ${email}. Open it to finish creating your account.` };
  }
  redirect("/documents");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
