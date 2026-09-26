import type { Report } from "@/lib/analysis/report";
import styles from "../documents.module.css";

const severityLabel = { severe: "Severe", high: "High", moderate: "Moderate" } as const;
const statusLabel = { absent: "Missing", partial: "Partly covered", present: "Covered" } as const;

export default function ReportView({ report }: { report: Report }) {
  const gaps = report.notInContract.filter((e) => e.status !== "present");
  const covered = report.notInContract.filter((e) => e.status === "present");

  return (
    <div className={styles.report}>
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className={styles.label}>
          Summary
        </h2>
        <p className={styles.summary}>{report.summary}</p>
      </section>

      <p className={styles.verdict}>
        {verdict(
          report.flags.length,
          gaps.filter((e) => e.status === "absent").length,
          gaps.filter((e) => e.status === "partial").length,
        )}
      </p>

      {report.flags.length > 0 && (
        <section aria-labelledby="flags-heading">
          <h2 id="flags-heading" className={styles.label}>
            Flagged clauses
          </h2>
          <ol className={styles.flags}>
            {report.flags.map((flag, i) => (
              <li key={i} className={`${styles.flag} ${styles[`flag-${flag.severity}`]}`}>
                <div className={styles.flagTags}>
                  <span className={styles.tag}>{severityLabel[flag.severity]}</span>
                  {flag.hitsRedLine && <span className={styles.tagRedLine}>Your red line</span>}
                </div>
                <blockquote className={styles.quote}>{flag.sourceSentence}</blockquote>
                <p className={styles.explanation}>{flag.explanation}</p>
                <a href={`#source-${i + 1}`} className={styles.jump}>
                  Show it in the contract
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="missing-heading" className={styles.missing}>
        <h2 id="missing-heading" className={styles.missingHeading}>
          Not in this contract
        </h2>
        <p className={styles.missingIntro}>
          Protections a freelance contract should give you. This is Redline&apos;s judgment of
          what the contract leaves out, so there is no sentence to quote.
        </p>
        <ul className={styles.protections}>
          {[...gaps, ...covered].map((entry) => (
            <li key={entry.key} className={styles[`protection-${entry.status}`]}>
              <span className={styles.status}>{statusLabel[entry.status]}</span>
              <span className={styles.protectionName}>{entry.name}</span>
              <p className={styles.protectionNote}>{entry.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {report.contextNotes.length > 0 && (
        <section aria-labelledby="normal-heading">
          <h2 id="normal-heading" className={styles.label}>
            Read and normal
          </h2>
          <ul className={styles.contextNotes}>
            {report.contextNotes.map((note, i) => (
              <li key={i}>
                <blockquote className={styles.quoteQuiet}>{note.sourceSentence}</blockquote>
                <p className={styles.explanation}>{note.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className={styles.checks}>
        <summary>What Redline checked</summary>
        <ul>
          {report.checksRun.map((check) => (
            <li key={`${check.kind}-${check.key}`}>{check.name}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

// A clean result says so plainly, but never reads as "safe to sign" while
// protections are missing (docs/adr/0005, 0006).
function verdict(flags: number, absent: number, partial: number): string {
  if (flags === 0 && absent === 0 && partial === 0) return "Nothing here needs your attention.";

  const gaps = [
    absent > 0 && `${absent} ${absent === 1 ? "protection is" : "protections are"} missing`,
    partial > 0 && `${partial} ${partial === 1 ? "is" : "are"} only partly covered`,
  ].filter(Boolean);
  const gapSentence = gaps.length > 0 ? `${gaps.join(" and ")}.` : "";

  if (flags === 0) {
    return `No clause needs flagging, but ${gapSentence} See "Not in this contract" below.`;
  }
  const clauses = `${flags} ${flags === 1 ? "clause" : "clauses"} to push back on, most serious first.`;
  return gapSentence ? `${clauses} ${gapSentence[0].toUpperCase()}${gapSentence.slice(1)}` : clauses;
}
