-- Brand Launch Playbook — New Schema
-- Per D-02: Fresh tables, do NOT modify existing tables
-- Per D-01: Row-per-module with JSONB responses (hybrid approach)
-- Per D-03: Progress derived from responses (count non-empty keys)

create table if not exists public.blp_responses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_slug  text not null,
  responses    jsonb not null default '{}',
  updated_at   timestamptz not null default now(),
  constraint blp_responses_user_module unique (user_id, module_slug)
);

-- Row-level security
alter table public.blp_responses enable row level security;

create policy "Users can read own responses"
  on public.blp_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert own responses"
  on public.blp_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own responses"
  on public.blp_responses for update
  using (auth.uid() = user_id);

-- Index for fast user+module lookups
create index if not exists blp_responses_user_module_idx
  on public.blp_responses (user_id, module_slug);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blp_responses_updated_at
  before update on public.blp_responses
  for each row execute function public.set_updated_at();

-- Circle config persistence (Phase 6, D-05) — admin-only via service role
create table if not exists public.blp_config (
  key   text primary key,
  value text not null
);
alter table public.blp_config enable row level security;
-- No user-facing RLS policies — all access via service role in API routes
