# Quiz Platform

A free, scalable **bilingual (Urdu / English) MCQ quiz platform** for Pakistan
Secondary Classes **9 & 10**. Built to run on **GitHub Pages** with no paid
hosting, using **Supabase Free** for secure student logins and result storage.

## Features
- Guest mode (practice without login) and Student login/register
- **Session persists across reloads** (Supabase `persistSession` + auto-refresh)
- **Email verification redirect** works on the `/quiz/` GitHub Pages subpath
- Class → Subject → Chapter → Settings flow
- Random questions & shuffled options, 1-minute timer with auto-submit
- Skip, progress indicator, daily streak, difficulty filter
- **Progress page**: average/best score, weak/strong subjects, completed chapters, streak, avg time
- **Leaderboard**: ranked by percentage → score → speed (best attempt per chapter)
- Dashboard, bilingual UI, PWA (service worker + manifest, offline cache)
- Results stored in Supabase (or locally for guests)

## Tech Stack
- HTML5, CSS3, Vanilla JavaScript (modular: auth / storage / questions / quiz / dashboard / progress / leaderboard / app)
- GitHub Pages (static hosting)
- Supabase (Auth + PostgreSQL: profiles, subjects, chapters, questions, options, quiz_results)
- Question bank: JSON files now, Swappable to Supabase later via `QUESTIONS_SOURCE`

## Folder Structure
```
quiz/
├── css/styles.css
├── js/
│   ├── config.js      # Supabase credentials + constants
│   ├── i18n.js        # Bilingual strings
│   ├── storage.js     # Local + Supabase persistence + session restore
│   ├── auth.js        # Student auth (login/register, email redirect)
│   ├── questions.js   # QuestionSource abstraction (JSON <-> Supabase)
│   ├── quiz.js        # Quiz engine
│   ├── dashboard.js   # Stats & history
│   ├── progress.js    # Task 5: progress page
│   ├── leaderboard.js # Task 6: leaderboard
│   └── app.js         # Controller / navigation
├── images/icon.svg
├── questions/9|10/{english,physics,math,chemistry}/*.json
├── data/supabase-schema.sql
├── sw.js / sw-register.js
├── manifest.json
└── index.html
```

## Setup
1. **GitHub Pages**: enable in repo Settings → Pages → Source: Deploy from a branch → `main` → `/ (root)`.
2. **Supabase**:
   - Create a project; run `data/supabase-schema.sql` in the SQL editor.
   - Copy URL + **publishable** anon key into `js/config.js` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`); set `SUPABASE_ENABLED = true`.
   - **Auth → Providers → Email**: decide on "Confirm email". If ON (default), students must click the confirmation link (it redirects to `https://<user>.github.io/quiz/`). To allow instant login, turn it OFF.
   - **Auth → URL Configuration → Redirect URLs**: add `https://<user>.github.io/quiz/`.
3. **Guest mode** works with no configuration.

## Security (Task 10)
- Only the **publishable anon key** is used client-side. No secret keys are ever shipped.
- All tables are protected by **Row Level Security**. Students can only read/write their own `profiles` and `quiz_results`. Catalog data (subjects/chapters/**approved** questions/options) is publicly readable but never student-writable. Teacher/Admin writes are added later via a separate admin role policy (schema already has `status`/`approved` columns — no migration needed).

## Migrating questions to Supabase (Task 8)
Keep JSON as-is, or flip `QUESTIONS_SOURCE: "supabase"` in `js/config.js` after
loading the question bank into the `questions`/`options` tables. `js/questions.js`
already implements `loadFromSupabase()`; no other file changes.

---

# MIGRATION GUIDE (this update)

## 1. Modified files
- `js/config.js` — added `QUESTIONS_SOURCE`; auth options live in storage.js
- `js/storage.js` — `createClient` auth options (Task 1); session restore (Task 3); richer `saveResult` (class/subject/chapter/percentage); friendly fallbacks (Task 12)
- `js/auth.js` — `emailRedirectTo` with `/quiz/` subpath (Task 2); auto-login returning users (Task 3)
- `js/quiz.js` — delegates loading to `QuestionSource` (Task 8/9)
- `js/app.js` — wires Progress/Leaderboard navigation; lazy-renders data screens (Task 11)
- `js/dashboard.js` — try/catch error handling (Task 12); uses stored `percentage`
- `js/i18n.js` — new EN/UR strings for Progress & Leaderboard
- `index.html` — new Progress & Leaderboard screens; new script tags
- `css/styles.css` — progress bars + leaderboard styles
- `sw.js` — never caches config/auth/storage JS or Supabase responses (Task 11)
- `data/supabase-schema.sql` — full new schema + RLS (Tasks 4, 7, 10)
- `README.md` — this guide

## 2. New files
- `js/questions.js` — `QuestionSource` abstraction (JSON ↔ Supabase)
- `js/progress.js` — Progress page logic (Task 5)
- `js/leaderboard.js` — Leaderboard logic (Task 6)
- `.nojekyll` — prevents GitHub Pages Jekyll processing

## 3. SQL for Supabase
Run the entire `data/supabase-schema.sql` in the Supabase SQL editor. It creates:
`profiles`, `subjects`, `chapters`, `questions`, `options`, `quiz_results`,
indexes, RLS policies, and a trigger that auto-creates a `profiles` row on signup.

## 4. RLS Policies (summary)
- `profiles`: user can SELECT/INSERT/UPDATE only where `auth.uid() = id`.
- `quiz_results`: user can SELECT/INSERT/DELETE only where `auth.uid() = user_id`.
- `subjects`, `chapters`: public SELECT (`using (true)`), no student writes.
- `questions`, `options`: SELECT only where `approved = true` (guests & students read approved content only).
- Teacher/Admin policies are intentionally omitted for now; the `status`/`approved` columns already support them without a schema change (Task 7).

## 5. Deployment steps
1. Commit and push to `main`.
2. In Supabase, run `data/supabase-schema.sql`.
3. Set `SUPABASE_URL` / `SUPABASE_ANON_KEY` in `js/config.js`; `SUPABASE_ENABLED = true`.
4. Enable GitHub Pages (root, main branch).
5. Add the Pages URL to Supabase Redirect URLs.
6. Wait ~1–2 min; hard-refresh to clear the old service worker.

## 6. Suggested commit message
```
feat: auth/session fixes, Progress & Leaderboard, scalable DB schema + RLS

- Task 1: createClient auth options (persist/autoRefresh/detectSession)
- Task 2: emailRedirectTo with /quiz/ subpath
- Task 3: auto session restore on load
- Task 4/7/10: profiles/subjects/chapters/questions/options/quiz_results + RLS
- Task 5: Progress page; Task 6: Leaderboard (best attempt per chapter)
- Task 8/9: QuestionSource abstraction; modular structure
- Task 11: SW never caches config/auth/Supabase
- Task 12/13: error handling + cleanup
```

## 7. Testing checklist
- [ ] Guest mode: take a quiz, see results, dashboard, progress, leaderboard note
- [ ] Register → receive confirmation email → click link → redirected to `/quiz/` → logged in
- [ ] Reload page → still logged in (session restored)
- [ ] Take a quiz while logged in → appears in Dashboard & Progress
- [ ] Leaderboard shows ranked students (percentage → score → speed)
- [ ] Wrong password → friendly error; no internet → graceful fallback
- [ ] Language toggle works on all screens
- [ ] GitHub Pages deploys; old service worker cleared after hard refresh
- [ ] Supabase: confirm a student cannot read another user's `quiz_results` (RLS)