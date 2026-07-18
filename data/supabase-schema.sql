-- ============================================================================
-- Quiz Platform — Supabase Schema (Tasks 4, 7, 10)
-- Run this entire script in the Supabase SQL editor (one pass).
-- Designed for the Free plan and to scale to 10,000+ students.
-- Only the publishable anon key is used client-side; all access is gated by
-- Row Level Security (RLS) below. No secret keys are ever exposed.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (student). Extended with school details.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  student_name text,
  class       smallint check (class in (9, 10)),
  section     text,
  school      text,
  city        text,
  board       text,            -- e.g. FBISE, BISE, Aga Khan
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subjects: bilingual subject catalog per class.
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
  id      bigint generated always as identity primary key,
  class   smallint not null check (class in (9, 10)),
  name_en text not null,
  name_ur text
);

-- ---------------------------------------------------------------------------
-- chapters: belong to a subject. Teacher portal will INSERT/UPDATE/DELETE here.
-- ---------------------------------------------------------------------------
create table if not exists public.chapters (
  id         bigint generated always as identity primary key,
  subject_id bigint not null references public.subjects (id) on delete cascade,
  chapter_no integer not null,
  name_en    text not null,
  name_ur    text
);

-- ---------------------------------------------------------------------------
-- questions: belong to a chapter. Teacher portal manages these.
-- `status` + `approved` prepare for the future Teacher/Admin workflow (Task 7)
-- without requiring a schema change later.
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id            bigint generated always as identity primary key,
  chapter_id    bigint not null references public.chapters (id) on delete cascade,
  question_en   text not null,
  question_ur   text,
  difficulty    text not null default 'Easy' check (difficulty in ('Easy','Medium','Hard')),
  explanation_en text,
  explanation_ur text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved      boolean not null default false,
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- options: 4 options per question, one marked correct.
-- ---------------------------------------------------------------------------
create table if not exists public.options (
  id          bigint generated always as identity primary key,
  question_id bigint not null references public.questions (id) on delete cascade,
  option_no   smallint not null check (option_no between 1 and 4),
  option_en   text not null,
  option_ur   text,
  is_correct  boolean not null default false
);

-- ---------------------------------------------------------------------------
-- quiz_results: one row per completed quiz attempt.
-- `attempt_no` lets us keep only the highest attempt per chapter for the
-- leaderboard (Task 6). `percentage` is stored to avoid recomputation.
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_results (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  class       smallint,
  subject     text,
  chapter     text,
  difficulty  text,
  score       integer not null,
  total       integer not null,
  percentage  numeric(5,2) not null,
  time_taken  integer not null,           -- seconds
  attempt_no  integer not null default 1,
  taken_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes for fast per-user and leaderboard queries (scales to 10k+ rows).
-- ---------------------------------------------------------------------------
create index if not exists idx_profiles_class      on public.profiles (class);
create index if not exists idx_subjects_class      on public.subjects (class);
create index if not exists idx_chapters_subject    on public.chapters (subject_id);
create index if not exists idx_questions_chapter   on public.questions (chapter_id);
create index if not exists idx_options_question    on public.options (question_id);
create index if not exists idx_results_user        on public.quiz_results (user_id, taken_at desc);
create index if not exists idx_results_chapter     on public.quiz_results (chapter);
create index if not exists idx_results_percentage  on public.quiz_results (percentage desc);

-- ===========================================================================
-- ROW LEVEL SECURITY (Task 10)
-- Principle: students see/modify ONLY their own rows. Public catalog data
-- (subjects, chapters, approved questions, options) is readable by everyone
-- (including guests) but never writable by students.
-- ===========================================================================
alter table public.profiles     enable row level security;
alter table public.quiz_results enable row level security;
alter table public.subjects     enable row level security;
alter table public.chapters     enable row level security;
alter table public.questions    enable row level security;
alter table public.options      enable row level security;

-- profiles: a user manages only their own profile.
drop policy if exists "Profiles: read own"        on public.profiles;
create policy "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Profiles: insert own"      on public.profiles;
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "Profiles: update own"      on public.profiles;
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- quiz_results: a user sees and inserts only their own results.
drop policy if exists "Results: read own"         on public.quiz_results;
create policy "Results: read own" on public.quiz_results
  for select using (auth.uid() = user_id);
drop policy if exists "Results: insert own"       on public.quiz_results;
create policy "Results: insert own" on public.quiz_results
  for insert with check (auth.uid() = user_id);
drop policy if exists "Results: delete own"       on public.quiz_results;
create policy "Results: delete own" on public.quiz_results
  for delete using (auth.uid() = user_id);

-- Catalog (subjects/chapters): public read, no student writes.
drop policy if exists "Subjects: public read"     on public.subjects;
create policy "Subjects: public read" on public.subjects for select using (true);
drop policy if exists "Chapters: public read"     on public.chapters;
create policy "Chapters: public read" on public.chapters for select using (true);

-- questions/options: guests & students may read only APPROVED questions.
-- (Teacher/Admin writes are added later via a separate admin role policy.)
drop policy if exists "Questions: read approved"  on public.questions;
create policy "Questions: read approved" on public.questions
  for select using (approved = true);
drop policy if exists "Options: read for approved" on public.options;
create policy "Options: read for approved" on public.options
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = options.question_id and q.approved = true
    )
  );

-- ===========================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a new auth user is created, insert a matching profiles row so the
-- app always has a profile to read/update. (Security-definer = runs with
-- the privileges of the function owner, bypassing RLS safely.)
-- ===========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();