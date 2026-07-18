// config.js — Supabase configuration and global app constants
// Replace these with your own Supabase project credentials.
// The app degrades gracefully (guest mode) if these are left as placeholders.
window.APP_CONFIG = {
  SUPABASE_URL: "https://nleeiypwmslovpvhbeki.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_vKZtYkvaynxCLSGsT0tzmQ_2g9Spseg",
  // When false, the app runs fully in guest/local mode without Supabase.
  SUPABASE_ENABLED: true,
  // "json" (default) reads questions from /questions/*.json.
  // Change to "supabase" after migrating the question bank to the DB (Task 8).
  QUESTIONS_SOURCE: "json",
  TIME_PER_QUESTION: 60, // seconds
  STORAGE_KEYS: {
    LANG: "quiz_lang",
    SESSION: "quiz_session",
    HISTORY: "quiz_history_guest",
    STREAK: "quiz_streak",
  },
};
