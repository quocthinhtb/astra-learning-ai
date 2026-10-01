insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', false)
on conflict (id) do nothing;

create policy "Users can upload own study materials"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'study-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can view own study materials"
on storage.objects for select to authenticated
using (
  bucket_id = 'study-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can update own study materials"
on storage.objects for update to authenticated
using (
  bucket_id = 'study-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'study-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users can delete own study materials"
on storage.objects for delete to authenticated
using (
  bucket_id = 'study-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);