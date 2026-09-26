-- Reports produced by the analysis engine, one row per run. The latest run
-- for a document is the one shown. Owner-only, like documents.

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  report jsonb not null,
  -- Which model produced it, e.g. anthropic/claude-sonnet-5@20260630.
  model text not null,
  created_at timestamptz not null default now()
);

create index analyses_document_id_created_at on public.analyses (document_id, created_at desc);

alter table public.analyses enable row level security;

create policy "Users read their own analyses"
  on public.analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- A user can only attach an analysis to a document they own.
create policy "Users add analyses to their own documents"
  on public.analyses for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = (select auth.uid())
    )
  );
