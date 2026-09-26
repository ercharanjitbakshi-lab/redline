// The two public Supabase settings. Both are safe in the browser; the
// secret service-role key never belongs here.
export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local.");
  return url;
}

export function supabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set. Add it to .env.local.");
  }
  return key;
}
