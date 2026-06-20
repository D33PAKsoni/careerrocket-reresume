
create table if not exists portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  slug        text not null unique,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

alter table portfolios enable row level security;

create policy "Users can read their own portfolio"
  on portfolios for select using (auth.uid() = user_id);

create policy "Users can insert their own portfolio"
  on portfolios for insert with check (auth.uid() = user_id);

create policy "Users can update their own portfolio"
  on portfolios for update using (auth.uid() = user_id);

create policy "Users can delete their own portfolio"
  on portfolios for delete using (auth.uid() = user_id);


create policy "Anyone can read public portfolios"
  on portfolios for select using (is_public = true);

create trigger portfolios_updated_at
  before update on portfolios
  for each row execute function update_updated_at();

create index if not exists portfolios_slug_idx on portfolios (slug);
