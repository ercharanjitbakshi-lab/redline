"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";
import styles from "./auth.module.css";

type Mode = "sign-in" | "sign-up";

export default function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>("sign-in");

  return mode === "sign-in" ? (
    <AuthForm
      key="sign-in"
      heading="Sign in"
      submitLabel="Sign in"
      pendingLabel="Signing in…"
      action={signIn}
      initialError={initialError}
      passwordAutoComplete="current-password"
      switchPrompt="New to Redline?"
      switchLabel="Create an account"
      onSwitch={() => setMode("sign-up")}
    />
  ) : (
    <AuthForm
      key="sign-up"
      heading="Create an account"
      submitLabel="Create account"
      pendingLabel="Creating account…"
      action={signUp}
      passwordAutoComplete="new-password"
      passwordHint="At least 8 characters."
      switchPrompt="Already have an account?"
      switchLabel="Sign in"
      onSwitch={() => setMode("sign-in")}
    />
  );
}

function AuthForm(props: {
  heading: string;
  submitLabel: string;
  pendingLabel: string;
  action: typeof signIn;
  initialError?: string;
  passwordAutoComplete: string;
  passwordHint?: string;
  switchPrompt: string;
  switchLabel: string;
  onSwitch: () => void;
}) {
  const [state, action, pending] = useActionState(
    props.action,
    props.initialError ? { error: props.initialError } : undefined,
  );

  return (
    <form action={action} className={styles.form}>
      <h1 className={styles.heading}>{props.heading}</h1>

      <label className={styles.label} htmlFor="email">
        Email
      </label>
      <input
        className={styles.input}
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />

      <label className={styles.label} htmlFor="password">
        Password
      </label>
      <input
        className={styles.input}
        id="password"
        name="password"
        type="password"
        autoComplete={props.passwordAutoComplete}
        minLength={props.passwordHint ? 8 : undefined}
        aria-describedby={props.passwordHint ? "password-hint" : undefined}
        required
      />
      {props.passwordHint && (
        <p id="password-hint" className={styles.hint}>
          {props.passwordHint}
        </p>
      )}

      <p className={styles.status} role="status" aria-live="polite">
        {state?.error && <span className={styles.error}>{state.error}</span>}
        {state?.notice && <span className={styles.notice}>{state.notice}</span>}
      </p>

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? props.pendingLabel : props.submitLabel}
      </button>

      <p className={styles.switch}>
        {props.switchPrompt}{" "}
        <button type="button" className={styles.link} onClick={props.onSwitch}>
          {props.switchLabel}
        </button>
      </p>
    </form>
  );
}
