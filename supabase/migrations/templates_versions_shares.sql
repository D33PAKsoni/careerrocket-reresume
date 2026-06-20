
alter table documents
  add column if not exists template text not null default 'classic'
    check (template in ('classic', 'modern', 'minimal'));

alter table documents
  add column if not exists share_slug text unique,
  add column if not exists is_shared boolean not null default false;


create policy "Anyone can read shared documents"
  on documents for select
  using (is_shared = true);

create table if not exists document_versions (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  content      jsonb,
  template     text not null default 'classic',
  label        text,
  created_at   timestamptz not null default now()
);

alter table document_versions enable row level security;

create policy "Users can read their own document versions"
  on document_versions for select using (auth.uid() = user_id);

create policy "Users can insert their own document versions"
  on document_versions for insert with check (auth.uid() = user_id);

create policy "Users can delete their own document versions"
  on document_versions for delete using (auth.uid() = user_id);

create index if not exists document_versions_document_id_created_at_idx
  on document_versions (document_id, created_at desc);
