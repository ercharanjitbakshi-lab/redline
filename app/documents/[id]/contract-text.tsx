import { locateInOriginal } from "@/lib/analysis/citation";
import type { Flag } from "@/lib/analysis/report";
import styles from "../documents.module.css";

const rank = { severe: 0, high: 1, moderate: 2 } as const;

// The contract as stored, with each flag's source sentence marked in place.
// Flag n's sentence gets id "source-n" so the report can link to it. Where
// two flags cover the same words, the more severe colour wins.
export default function ContractText({ text, flags }: { text: string; flags: Flag[] }) {
  // Per character: the most severe flag covering it, or -1.
  const cover = new Int32Array(text.length).fill(-1);
  const anchorAt = new Map<number, number[]>();

  flags.forEach((flag, index) => {
    const span = locateInOriginal(flag.sourceSentence, text);
    if (!span) return;
    anchorAt.set(span.start, [...(anchorAt.get(span.start) ?? []), index]);
    for (let i = span.start; i < span.end; i++) {
      const current = cover[i];
      if (current === -1 || rank[flag.severity] < rank[flags[current].severity]) cover[i] = index;
    }
  });

  const parts: React.ReactNode[] = [];
  let i = 0;
  while (i < text.length) {
    let j = i + 1;
    // A run ends where the covering flag changes or another sentence starts.
    while (j < text.length && cover[j] === cover[i] && !anchorAt.has(j)) j++;
    const anchors = (anchorAt.get(i) ?? []).map((n) => (
      <span key={`a${n}`} id={`source-${n + 1}`} className={styles.anchor} />
    ));
    const chunk = text.slice(i, j);
    parts.push(
      ...anchors,
      cover[i] === -1 ? (
        chunk
      ) : (
        <mark key={i} className={styles[`mark-${flags[cover[i]].severity}`]}>
          {chunk}
        </mark>
      ),
    );
    i = j;
  }

  return <div className={styles.documentText}>{parts}</div>;
}
