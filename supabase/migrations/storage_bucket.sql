
insert into storage.buckets (id, name, public)
values ('resume-uploads', 'resume-uploads', false)
on conflict (id) do nothing;

create policy "Users can upload their own resume files"
  on storage.objects for insert
  with check (
    bucket_id = 'resume-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own resume files"
  on storage.objects for select
  using (
    bucket_id = 'resume-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own resume files"
  on storage.objects for delete
  using (
    bucket_id = 'resume-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own resume files"
  on storage.objects for update
  using (
    bucket_id = 'resume-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
