"use client";

import { useRef, useState, useTransition } from "react";
import { ExtractionError, extractText } from "@/lib/extract/extract-text";
import { saveDocument } from "./actions";
import styles from "./documents.module.css";

// Picks a PDF or .docx, reads its text here in the browser, and saves only
// the text.
export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "reading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleFile(file: File) {
    setError(null);
    setStatus("reading");
    let text: string;
    try {
      text = await extractText(file);
    } catch (e) {
      setError(e instanceof ExtractionError ? e.message : "Redline couldn't read that file. Try another.");
      setStatus("idle");
      return;
    }

    setStatus("saving");
    const title = file.name.replace(/\.(pdf|docx)$/i, "");
    startTransition(async () => {
      // On success the action redirects to the new document.
      const result = await saveDocument(title, text);
      if (result?.error) {
        setError(result.error);
        setStatus("idle");
      }
    });
  }

  const busy = status !== "idle";

  return (
    <div className={styles.upload}>
      <button
        type="button"
        className={styles.cta}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {status === "reading" ? "Reading…" : status === "saving" ? "Saving…" : "Upload a contract"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className={styles.visuallyHidden}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) handleFile(file);
        }}
      />
      <p className={styles.hint}>
        PDF or Word (.docx). The file stays on your computer. Only its text is saved.
      </p>
      <p className={styles.error} role="status" aria-live="polite">
        {error}
      </p>
    </div>
  );
}
