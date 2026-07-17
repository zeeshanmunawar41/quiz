// storage.js — Local storage helpers + Supabase results persistence
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;
  let supabase = null;

  function initSupabase() {
    if (CFG.SUPABASE_ENABLED && window.supabase && CFG.SUPABASE_URL !== "https://YOUR-PROJECT.supabase.co") {
      supabase = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    }
    return supabase;
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
  async function saveResult(result) {
    const session = getSession();
    if (supabase && session && session.user) {
      const { error } = await supabase.from("quiz_results").insert({
        user_id: session.user.id,
        quiz_id: result.quizId,
        score: result.score,
        total: result.total,
        time_taken: result.timeTaken,
        taken_at: result.takenAt,
      });
      if (error) console.warn("Supabase insert failed:", error.message);
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
        return [];
      }
      return data || [];
    }
    return getGuestHistory();
  }

  window.Storage = {
    initSupabase,
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