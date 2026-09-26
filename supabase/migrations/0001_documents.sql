-- A user's saved documents. Only the extracted text is stored, never the
-- original file (CLAUDE.md). Row-level security keeps each user to their own
-- rows, whatever the app code does.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  text text not null check (char_length(text) between 1 and 300000),
  created_at timestamptz not null default now()
);

create index documents_user_id_created_at on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

create policy "Users read their own documents"
  on public.documents for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users add their own documents"
  on public.documents for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own documents"
  on public.documents for delete
  to authenticated
  using ((select auth.uid()) = user_id);
