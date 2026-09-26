import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../login/actions";
import styles from "../login/auth.module.css";

// The saved library will live here. For now it confirms who is signed in.
export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The proxy already redirects signed-out visitors; this guards the page itself.
  if (!user) redirect("/login");

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <Link href="/" className={styles.wordmark}>
          Redline
        </Link>
        <div className={styles.account}>
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className={styles.link}>
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.heading}>Your documents</h1>
          <p className={styles.empty}>No documents yet. Contracts you review will be saved here.</p>
        </div>
      </main>
    </div>
  );
}
