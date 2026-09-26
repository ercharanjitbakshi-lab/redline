import Link from "next/link";
import LoginForm from "./login-form";
import styles from "./auth.module.css";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { confirm } = await searchParams;

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <Link href="/" className={styles.wordmark}>
          Redline
        </Link>
      </header>
      <main className={styles.main}>
        <LoginForm
          initialError={
            confirm === "failed"
              ? "That confirmation link has expired or was already used. Try signing in, or create your account again."
              : undefined
          }
          initialNotice={
            confirm === "done" ? "Your email is confirmed. Sign in to continue." : undefined
          }
        />
      </main>
    </div>
  );
}
