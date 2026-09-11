"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

const CLAUSES = [
  {
    severity: "severe" as const,
    number: "7. Intellectual Property.",
    lead:
      "All Work Product, together with any pre-existing tools, materials, and methods of Contractor incorporated therein, is deemed a work made for hire, and",
    flagged:
      "all right, title, and interest therein shall vest exclusively in Client immediately upon creation, regardless of the payment status of any invoice issued hereunder.",
    tag: "Severe",
    note:
      "This clause assigns your pre-existing tools and materials too, and the rights transfer the moment you create the work — before you've been paid. Ask for assignment on payment, and a carve-out for what you already owned.",
  },
  {
    severity: "high" as const,
    number: "12. Payment.",
    lead: "Client shall pay all approved invoices within ninety (90) days of",
    flagged:
      "Client's sole discretion to approve, following delivery of the Work Product.",
    tag: "High",
    note:
      "Payment is gated behind an open-ended approval step before the 90-day clock even starts. Ask for a fixed due date measured from delivery, not from approval.",
  },
];

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <span className={styles.wordmark}>Redline</span>
      </header>

      <main className={styles.main}>
        <div className={styles.document}>
          {CLAUSES.map((clause, index) => (
            <div
              key={clause.number}
              className={styles.clause}
              data-severity={clause.severity}
              style={{ ["--stagger" as string]: `${index * 0.4}s` }}
            >
              <div className={styles.clauseDoc}>
                <p className={styles.lead}>
                  <span className={styles.clauseNumber}>{clause.number}</span>{" "}
                  {clause.lead}
                </p>
                <div className={styles.flaggedRow}>
                  <span className={styles.bar} aria-hidden="true" />
                  <p className={styles.flaggedText}>
                    <span className={styles.flag}>{clause.flagged}</span>
                  </p>
                </div>
              </div>
              <div className={styles.balloon}>
                <span className={styles.balloonTag}>{clause.tag}</span>
                <p className={styles.balloonQuote}>&ldquo;{clause.flagged}&rdquo;</p>
                <p className={styles.balloonText}>{clause.note}</p>
              </div>
            </div>
          ))}
          <p className={styles.caption}>
            Example clauses shown above — not a real contract.
          </p>
        </div>

        <section className={styles.pitch}>
          <p className={styles.tagline}>
            Redline reviews a freelance contract before you sign it, and
            drafts the counter-offer you can send back.
          </p>

          {fileName === null ? (
            <>
              <button
                type="button"
                className={styles.cta}
                onClick={() => fileInputRef.current?.click()}
              >
                Try it on a document
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className={styles.visuallyHidden}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setFileName(file.name);
                }}
              />
            </>
          ) : (
            <div className={styles.afterSelect}>
              <p>
                You picked <strong>{fileName}</strong>. Uploads aren&apos;t
                wired up yet — you just watched Redline read a clause the
                way it would read yours.
              </p>
              <button
                type="button"
                className={styles.reset}
                onClick={() => {
                  setFileName(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Choose a different file
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
