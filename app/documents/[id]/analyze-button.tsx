"use client";

import { useActionState } from "react";
import { analyzeDocument, type AnalyzeState } from "./actions";
import styles from "../documents.module.css";

export default function AnalyzeButton({ documentId, again }: { documentId: string; again: boolean }) {
  const [state, action, pending] = useActionState(
    async (): Promise<AnalyzeState> => analyzeDocument(documentId),
    undefined,
  );

  return (
    <form action={action} className={styles.analyze}>
      <button type="submit" className={again ? styles.secondary : styles.cta} disabled={pending}>
        {pending ? "Reading your contract…" : again ? "Run the analysis again" : "Analyze this contract"}
      </button>
      <p className={styles.hint} role="status" aria-live="polite">
        {pending ? "This takes about half a minute." : null}
      </p>
      {state?.error && <p className={styles.error}>{state.error}</p>}
    </form>
  );
}
