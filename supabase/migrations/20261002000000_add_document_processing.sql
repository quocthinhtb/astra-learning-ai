alter table public.documents
  add column if not exists processing_error text,
  add column if not exists processed_at timestamptz;

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create index if not exists document_chunks_document_id_idx on public.document_chunks(document_id);
create index if not exists document_chunks_user_id_idx on public.document_chunks(user_id);

alter table public.document_chunks enable row level security;

create policy "Users can view own document chunks"
on public.document_chunks for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own document chunks"
on public.document_chunks for insert
to authenticated
with check ((select auth.uid()) = user_id and exists (
  select 1 from public.documents d
  where d.id = document_id and d.user_id = (select auth.uid())
));

create policy "Users can update own document chunks"
on public.document_chunks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own document chunks"
on public.document_chunks for delete
to authenticated
using ((select auth.uid()) = user_id);