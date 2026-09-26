import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Masthead from "./masthead";
import UploadButton from "./upload-button";
import styles from "./documents.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The proxy already redirects signed-out visitors; this guards the page itself.
  if (!user) redirect("/login");

  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className={styles.page}>
      <Masthead email={user.email} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.heading}>Your documents</h1>
          <UploadButton />

          {error ? (
            <p className={styles.error}>We couldn&apos;t load your documents. Refresh to try again.</p>
          ) : documents.length === 0 ? (
            <p className={styles.empty}>No documents yet. Contracts you upload will be saved here.</p>
          ) : (
            <ul className={styles.list}>
              {documents.map((doc) => (
                <li key={doc.id}>
                  <Link href={`/documents/${doc.id}`} className={styles.item}>
                    <span className={styles.itemTitle}>{doc.title}</span>
                    <span className={styles.itemDate}>{dateFormat.format(new Date(doc.created_at))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
