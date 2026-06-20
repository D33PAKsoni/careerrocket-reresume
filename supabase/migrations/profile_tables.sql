
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text,
  headline    text,
  location    text,
  phone       text,
  github_url  text,
  linkedin_url text,
  website_url text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id)
);

alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = user_id);

create policy "Users can delete their own profile"
  on profiles for delete using (auth.uid() = user_id);

create table if not exists education (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles(id) on delete cascade,
  institution    text not null,
  degree         text,
  field_of_study text,
  start_year     integer,
  end_year       integer,
  grade          text,
  created_at     timestamptz not null default now()
);

alter table education enable row level security;

create policy "Users can manage their own education"
  on education for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create table if not exists experiences (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  role         text not null,
  organisation text not null,
  location     text,
  start_date   date,
  end_date     date,
  is_current   boolean not null default false,
  description  text,
  created_at   timestamptz not null default now()
);

alter table experiences enable row level security;

create policy "Users can manage their own experiences"
  on experiences for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  title       text not null,
  description text,
  tech_stack  text,
  link        text,
  repo_link   text,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Users can manage their own projects"
  on projects for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create table if not exists skills (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name       text not null,
  category   text,
  created_at timestamptz not null default now()
);

alter table skills enable row level security;

create policy "Users can manage their own skills"
  on skills for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create table if not exists certifications (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references profiles(id) on delete cascade,
  title          text not null,
  issuer         text,
  issue_date     date,
  expiry_date    date,
  credential_url text,
  created_at     timestamptz not null default now()
);

alter table certifications enable row level security;

create policy "Users can manage their own certifications"
  on certifications for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();
