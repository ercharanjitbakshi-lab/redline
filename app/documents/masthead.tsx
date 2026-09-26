import Link from "next/link";
import { signOut } from "../login/actions";
import styles from "./documents.module.css";

export default function Masthead({ email }: { email: string | undefined }) {
  return (
    <header className={styles.masthead}>
      <Link href="/documents" className={styles.wordmark}>
        Redline
      </Link>
      <div className={styles.account}>
        <span>{email}</span>
        <form action={signOut}>
          <button type="submit" className={styles.link}>
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
