

create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('resume', 'cover_letter', 'linkedin')),
  status      text not null default 'draft' check (status in ('draft', 'generated')),
  title       text,
  job_description text,
  content     jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table documents enable row level security;

create policy "Users can read their own documents"
  on documents for select using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete using (auth.uid() = user_id);

create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

create index if not exists documents_user_id_created_at_idx
  on documents (user_id, created_at desc);
