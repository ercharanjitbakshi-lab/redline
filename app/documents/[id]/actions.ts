"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyze } from "@/lib/analysis/analyze";
import { modelConfig } from "@/lib/model/config";
import { createOpenRouterClient } from "@/lib/model/openrouter";
import { createClient } from "@/lib/supabase/server";

export type AnalyzeState = { error: string } | undefined;

// Runs the analysis engine on one saved document and stores the report.
// Takes about half a minute; the page sets maxDuration to allow for it.
export async function analyzeDocument(documentId: string): Promise<AnalyzeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Row-level security: another user's document comes back empty.
  const { data: doc } = await supabase
    .from("documents")
    .select("text")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return { error: "That document doesn't exist or isn't yours." };

  let report;
  try {
    const model = await createOpenRouterClient({
      apiKey: process.env.OPENROUTER_API_KEY ?? "",
      config: modelConfig,
    });
    // Red lines join here once the red-lines editor exists.
    report = await analyze({ documentText: doc.text, redLines: [] }, { model });
  } catch (error) {
    console.error("Analysis failed", error);
    return { error: "Redline couldn't finish the analysis. Try again in a minute." };
  }

  const { error } = await supabase.from("analyses").insert({
    document_id: documentId,
    report,
    model: `${modelConfig.model}@${modelConfig.version}`,
  });
  if (error) {
    console.error("Saving the analysis failed", error);
    return { error: "The analysis finished but couldn't be saved. Try again." };
  }

  revalidatePath(`/documents/${documentId}`);
}
