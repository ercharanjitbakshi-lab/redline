import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Report } from "@/lib/analysis/report";
import { createClient } from "@/lib/supabase/server";
import Masthead from "../masthead";
import AnalyzeButton from "./analyze-button";
import ContractText from "./contract-text";
import ReportView from "./report-view";
import styles from "../documents.module.css";

// The analysis server action runs on this page and takes about 30 seconds.
export const maxDuration = 300;

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

  const { data: analysis } = await supabase
    .from("analyses")
    .select("report, created_at")
    .eq("document_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const report = (analysis?.report ?? null) as Report | null;

  return (
    <div className={styles.page}>
      <Masthead email={user.email} />
      <main className={styles.main}>
        <div className={styles.content}>
          <Link href="/documents" className={styles.back}>
            ← Your documents
          </Link>
          <h1 className={styles.heading}>{doc.title}</h1>
          <p className={styles.meta}>
            Uploaded {dateFormat.format(new Date(doc.created_at))}
            {analysis && ` · Analyzed ${dateFormat.format(new Date(analysis.created_at))}`}
          </p>

          {report ? (
            <ReportView report={report} />
          ) : (
            <p className={styles.notice}>
              This is the text Redline read from your file. Check that it matches the original:
              flags will quote from it word for word.
            </p>
          )}

          <AnalyzeButton documentId={id} again={report !== null} />

          <h2 className={styles.label}>The contract</h2>
          <ContractText text={doc.text} flags={report?.flags ?? []} />
        </div>
      </main>
    </div>
  );
}
