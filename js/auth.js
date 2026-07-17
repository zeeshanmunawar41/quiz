// auth.js — Student authentication via Supabase (falls back to local guest)
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;
  let supabase = null;
  let mode = "login"; // "login" | "register"

  function init() {
    supabase = window.Storage.initSupabase();
    bindEvents();
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
      submit.textContent = window.I18N.t("login").includes("Register") ? "Register" : "Register";
      submit.textContent = "Register";
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

    let result;
    if (mode === "register") {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      msg.textContent = result.error.message;
      msg.className = "msg error";
      return;
    }

    const session = result.data.session || (result.data.user ? { user: result.data.user } : null);
    if (session) {
      window.Storage.saveSession(session);
      msg.textContent = "Success!";
      msg.className = "msg success";
      window.App.navigate("classSelect");
    } else {
      msg.textContent = "Check your email to confirm registration.";
      msg.className = "msg success";
    }
  }

  function restoreSession() {
    const session = window.Storage.getSession();
    if (session && session.user) {
      // Optionally navigate directly; left to app controller.
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