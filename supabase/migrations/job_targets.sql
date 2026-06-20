
create table if not exists job_targets (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid not null references documents(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  raw_text        text not null,
  company_name    text,
  role_name       text,
  keywords        jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

alter table job_targets enable row level security;

create policy "Users can read their own job targets"
  on job_targets for select using (auth.uid() = user_id);

create policy "Users can insert their own job targets"
  on job_targets for insert with check (auth.uid() = user_id);

create policy "Users can update their own job targets"
  on job_targets for update using (auth.uid() = user_id);

create policy "Users can delete their own job targets"
  on job_targets for delete using (auth.uid() = user_id);


create index if not exists job_targets_document_id_created_at_idx
  on job_targets (document_id, created_at desc);
