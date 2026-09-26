import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Masthead from "../masthead";
import styles from "../documents.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function DocumentPage({ params }: PageProps<"/documents/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row-level security returns nothing for another user's document.
  const { data: doc } = await supabase
    .from("documents")
    .select("title, text, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!doc) notFound();

  return (
    <div className={styles.page}>
      <Masthead email={user.email} />
      <main className={styles.main}>
        <div className={styles.content}>
          <Link href="/documents" className={styles.back}>
            ← Your documents
          </Link>
          <h1 className={styles.heading}>{doc.title}</h1>
          <p className={styles.meta}>Uploaded {dateFormat.format(new Date(doc.created_at))}</p>

          <p className={styles.notice}>
            This is the text Redline read from your file. Check that it matches the
            original: flags will quote from it word for word. The analysis isn&apos;t
            connected yet.
          </p>

          <div className={styles.documentText}>{doc.text}</div>
        </div>
      </main>
    </div>
  );
}
