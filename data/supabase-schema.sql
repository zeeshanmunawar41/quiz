-- Supabase schema for Quiz Platform (Version 1)
-- Run this in the Supabase SQL editor.
-- Only stores minimal quiz results per the project bible.

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id text not null,
  score integer not null,
  total integer not null,
  time_taken integer not null,
  taken_at timestamptz not null default now()
);

-- Index for fast per-user history lookups
create index if not exists idx_quiz_results_user on public.quiz_results (user_id, taken_at desc);

-- Row Level Security: a user can only see and insert their own results.
alter table public.quiz_results enable row level security;

drop policy if exists "Users read own results" on public.quiz_results;
create policy "Users read own results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own results" on public.quiz_results;
create policy "Users insert own results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);