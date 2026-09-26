"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_TEXT_LENGTH } from "@/lib/extract/limits";

export type SaveResult = { error: string } | undefined;

// Saves extracted text as a new document and opens it. The caller is
// untrusted: sign-in, types and sizes are all checked here.
export async function saveDocument(title: unknown, text: unknown): Promise<SaveResult> {
  if (typeof title !== "string" || typeof text !== "string") {
    return { error: "Something went wrong reading that file. Try again." };
  }
  const cleanTitle = title.trim().slice(0, 200) || "Untitled document";
  if (text.trim() === "" || text.length > MAX_TEXT_LENGTH) {
    return { error: "That document is empty or too long to save." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("documents")
    .insert({ title: cleanTitle, text })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "We couldn't save your document. Try again in a minute." };
  }
  redirect(`/documents/${data.id}`);
}
