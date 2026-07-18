// auth.js — Student authentication via Supabase (falls back to local guest)
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;
  let supabase = null;
  let mode = "login"; // "login" | "register"

  function init() {
    supabase = window.Storage.initSupabase();
    bindEvents();
    if (supabase) {
      // Keep the local session in sync with Supabase (handles expiry/refresh).
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) window.Storage.saveSession(session);
        else window.Storage.clearSession();
      });
      // Restore a previously saved session into the Supabase client so the
      // user stays logged in across page reloads (critical for GitHub Pages).
      // Task 3: if a valid session exists, keep the user logged in and send
      // them straight to the class selection screen — no re-login prompt.
      window.Storage.restoreSession().then(() => {
        if (window.Auth.isLoggedIn()) {
          window.App.navigate("classSelect");
        }
      });
    }
    restoreSession();
  }

  function bindEvents() {
    const form = document.getElementById("authForm");
    const toggle = document.getElementById("authToggleMode");
    form.addEventListener("submit", handleSubmit);
    toggle.addEventListener("click", toggleMode);
  }

  function toggleMode() {
    mode = mode === "login" ? "register" : "login";
    const submit = document.getElementById("authSubmit");
    const toggle = document.getElementById("authToggleMode");
    const title = document.querySelector("#auth h2");
    if (mode === "register") {
      submit.textContent = window.I18N.t("login") === "Register" ? window.I18N.t("login") : "Register";
      toggle.textContent = window.I18N.t("have_account");
      title.textContent = "Student Register";
    } else {
      submit.textContent = window.I18N.t("login");
      toggle.textContent = window.I18N.t("need_account");
      title.textContent = window.I18N.t("auth_title");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const msg = document.getElementById("authMsg");
    msg.textContent = "";
    msg.className = "msg";

    if (!supabase) {
      msg.textContent = "Supabase not configured. Use Guest mode for now.";
      msg.className = "msg error";
      return;
    }

    msg.textContent = window.I18N.t("loading");
    msg.className = "msg";

    let result;
    try {
      if (mode === "register") {
        // Task 2: send the email-confirmation link back to the app.
        // On GitHub Pages the site lives at /quiz/, so the redirect URL must
        // include that subpath or the token in the URL will never be read.
        const redirectUrl = window.location.origin + "/quiz/";
        result = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
    } catch (err) {
      msg.textContent = err.message || "Network error. Check your connection.";
      msg.className = "msg error";
      return;
    }

    if (result.error) {
      // Common GitHub Pages / Supabase case: email not confirmed yet.
      if (/confirm/i.test(result.error.message)) {
        msg.textContent = "Please confirm your email, then log in.";
      } else {
        msg.textContent = result.error.message;
      }
      msg.className = "msg error";
      return;
    }

    const session = result.data.session;
    if (session) {
      window.Storage.saveSession(session);
      msg.textContent = "Success!";
      msg.className = "msg success";
      window.App.navigate("classSelect");
    } else {
      // signUp succeeded but email confirmation is required by Supabase.
      msg.textContent = "Account created. Check your email to confirm, then log in.";
      msg.className = "msg success";
      mode = "login";
      toggleMode();
    }
  }

  function restoreSession() {
    const session = window.Storage.getSession();
    if (session && session.user) {
      // Session is already restored into the Supabase client by
      // Storage.restoreSession(); here we just expose login state.
      // Optionally auto-navigate returning users to the class screen.
    }
  }

  function logout() {
    if (supabase) supabase.auth.signOut();
    window.Storage.clearSession();
  }

  function isLoggedIn() {
    const session = window.Storage.getSession();
    return !!(session && session.user);
  }

  function currentUser() {
    const session = window.Storage.getSession();
    return session ? session.user : null;
  }

  window.Auth = { init, logout, isLoggedIn, currentUser };
})();
