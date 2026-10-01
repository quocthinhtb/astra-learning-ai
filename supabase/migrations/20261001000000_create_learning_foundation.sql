create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text,
  mime_type text,
  file_size bigint,
  processing_status text not null default 'pending' check (processing_status in ('pending','processing','completed','failed')),
  extracted_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  topic text not null,
  mastery numeric(5,2) not null default 0 check (mastery >= 0 and mastery <= 100),
  last_studied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, topic)
);

create index courses_user_id_idx on public.courses(user_id);
create index documents_course_id_idx on public.documents(course_id);
create index documents_user_id_idx on public.documents(user_id);
create index learning_progress_user_id_idx on public.learning_progress(user_id);
create index learning_progress_course_id_idx on public.learning_progress(course_id);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.learning_progress enable row level security;

create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users can view own courses" on public.courses for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own courses" on public.courses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own courses" on public.courses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own courses" on public.courses for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view own documents" on public.documents for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own documents" on public.documents for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.courses c where c.id = course_id and c.user_id = (select auth.uid())));
create policy "Users can update own documents" on public.documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own documents" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users can view own progress" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own progress" on public.learning_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own progress" on public.learning_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own progress" on public.learning_progress for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
