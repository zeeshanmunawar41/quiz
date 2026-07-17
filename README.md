# Quiz Platform

A free, scalable **bilingual (Urdu / English) MCQ quiz platform** for Pakistan
Secondary Classes **9 & 10**. Built to run on **GitHub Pages** with no paid
hosting, using **Supabase Free** for secure student logins and result storage.

## Features (Version 1)
- Guest mode (practice without login) and Student login/register
- Class → Subject → Chapter → Settings flow
- Random questions & shuffled options
- 1-minute-per-question timer with auto-submit
- Skip question, progress indicator, daily streak
- Difficulty filter (Easy / Medium / Hard)
- Answer explanations and a full review screen
- Dashboard: overall & subject-wise accuracy, best/weakest subject, history
- Bilingual UI (toggle English / اردو)
- Progressive Web App (service worker + manifest, offline cache)
- Results stored in Supabase (or locally for guests)

## Tech Stack
- HTML5, CSS3, Vanilla JavaScript
- GitHub Pages (static hosting)
- Supabase (Auth + `quiz_results` table)
- Question bank as JSON files in the repo

## Folder Structure
```
quiz/
├── assets/
├── css/styles.css
├── js/
│   ├── config.js      # Supabase credentials + constants
│   ├── i18n.js        # Bilingual strings
│   ├── storage.js     # Local + Supabase persistence
│   ├── auth.js        # Student auth
│   ├── quiz.js        # Quiz engine
│   ├── dashboard.js   # Stats & history
│   └── app.js         # Controller / navigation
├── images/icon.svg
├── questions/9/{english,physics,math,chemistry}/*.json
├── questions/10/{english,physics,math,chemistry}/*.json
├── data/supabase-schema.sql
├── sw.js / sw-register.js
├── manifest.json
└── index.html
```

## Setup
1. **GitHub Pages**: Push this folder to a repo and enable Pages (root).
2. **Supabase** (optional but recommended for students):
   - Create a project at supabase.com.
   - Run `data/supabase-schema.sql` in the SQL editor.
   - Copy the project URL + anon key into `js/config.js`
     (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) and set `SUPABASE_ENABLED = true`.
   - Enable Email auth in Supabase Auth settings.
3. **Guest mode** works out of the box with no configuration.

## Adding Questions
Each chapter is a JSON file under `questions/<class>/<subject>/<chapter>.json`:
```json
{
  "subject": "Physics",
  "class": "9",
  "chapter": "Motion",
  "questions": [
    {
      "question": "English text",
      "questionUr": "اردو متن",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "difficulty": "Easy",
      "explanation": "English explanation",
      "explanationUr": "اردو وضاحت"
    }
  ]
}
```
Never hardcode questions in JS — the JSON files are the single source of truth.

## Roadmap
- V2: Teacher portal
- V3: Analytics
- V4: PWA enhancements