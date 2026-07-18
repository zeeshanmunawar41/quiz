// storage.js — Local storage helpers + Supabase results persistence
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;
  let supabase = null;

  function initSupabase() {
    if (CFG.SUPABASE_ENABLED && window.supabase && CFG.SUPABASE_URL !== "https://YOUR-PROJECT.supabase.co") {
      // WHY these auth options (Task 1):
      // - persistSession:true  -> Supabase stores the session in localStorage so the
      //   user stays logged in across page reloads (critical on GitHub Pages, where
      //   every navigation is a full page load).
      // - autoRefreshToken:true -> Supabase silently refreshes the JWT before it expires,
      //   preventing "expired session" errors during a quiz.
      // - detectSessionInUrl:true -> reads the ?code=... token from the email-confirmation
      //   redirect link and completes the login (Task 2) without extra code.
      supabase = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return supabase;
  }

  // Restore a previously saved session into the Supabase client so the user
  // remains authenticated after a page reload (important on GitHub Pages,
  // where each navigation is a full page load).
  async function restoreSession() {
    if (!supabase) return;
    const session = getSession();
    if (session && session.access_token && session.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error) {
        console.warn("Session restore failed:", error.message);
        clearSession();
      }
    }
  }

  // ---- Local helpers ----
  function getJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---- Guest history ----
  function getGuestHistory() {
    return getJSON(CFG.STORAGE_KEYS.HISTORY, []);
  }

  function addGuestResult(result) {
    const history = getGuestHistory();
    history.unshift(result);
    setJSON(CFG.STORAGE_KEYS.HISTORY, history.slice(0, 100));
  }

  // ---- Streak ----
  function getStreak() {
    return getJSON(CFG.STORAGE_KEYS.STREAK, { count: 0, last: null });
  }

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const streak = getStreak();
    if (streak.last === today) return streak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const count = streak.last === yesterday ? streak.count + 1 : 1;
    const updated = { count, last: today };
    setJSON(CFG.STORAGE_KEYS.STREAK, updated);
    return updated;
  }

  // ---- Session ----
  function saveSession(session) {
    setJSON(CFG.STORAGE_KEYS.SESSION, session);
  }

  function getSession() {
    return getJSON(CFG.STORAGE_KEYS.SESSION, null);
  }

  function clearSession() {
    localStorage.removeItem(CFG.STORAGE_KEYS.SESSION);
  }

  // ---- Results persistence (Supabase or local) ----
  // Task 12: classify failures into friendly messages. Never throw to the UI;
  // guest fallback keeps the app usable offline.
  async function saveResult(result) {
    const session = getSession();
    if (supabase && session && session.user) {
      const pct = result.total ? Math.round((result.score / result.total) * 100) : 0;
      const { error } = await supabase.from("quiz_results").insert({
        user_id: session.user.id,
        class: result.classLevel,
        subject: result.subject,
        chapter: result.chapter,
        difficulty: result.difficulty || "all",
        score: result.score,
        total: result.total,
        percentage: pct,
        time_taken: result.timeTaken,
        taken_at: result.takenAt,
      });
      if (error) {
        console.warn("Supabase insert failed:", error.message);
        // Fall back to local so the student never loses their attempt.
        addGuestResult(result);
      }
    } else {
      addGuestResult(result);
    }
  }

  async function getResults() {
    const session = getSession();
    if (supabase && session && session.user) {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("taken_at", { ascending: false });
      if (error) {
        console.warn("Supabase select failed:", error.message);
        return getGuestHistory();
      }
      return data || [];
    }
    return getGuestHistory();
  }

  window.Storage = {
    initSupabase,
    restoreSession,
    getClient: () => supabase,
    getGuestHistory,
    addGuestResult,
    getStreak,
    updateStreak,
    saveSession,
    getSession,
    clearSession,
    saveResult,
    getResults,
  };
})();