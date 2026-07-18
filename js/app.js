// app.js — Main controller: navigation, screen flow, event wiring
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;

  // Subject catalog per class (folder names under questions/<class>/)
  const SUBJECTS = {
    9: [
      { id: "english", name: "English", ur: "انگریزی" },
      { id: "physics", name: "Physics", ur: "طبیعیات" },
      { id: "math", name: "Mathematics", ur: "ریاضی" },
      { id: "chemistry", name: "Chemistry", ur: "کیمیاء" },
    ],
    10: [
      { id: "english", name: "English", ur: "انگریزی" },
      { id: "physics", name: "Physics", ur: "طبیعیات" },
      { id: "math", name: "Mathematics", ur: "ریاضی" },
      { id: "chemistry", name: "Chemistry", ur: "کیمیاء" },
    ],
  };

  // Chapter catalog per class/subject (file names under questions/<class>/<subject>/)
  const CHAPTERS = {
    9: {
      english: [{ id: "grammar", name: "Grammar", ur: "گرامر" }],
      physics: [{ id: "motion", name: "Motion", ur: "حرکت" }],
      math: [{ id: "algebra", name: "Algebra", ur: "الجبر" }],
      chemistry: [{ id: "basics", name: "Basics", ur: "بنیادیں" }],
    },
    10: {
      english: [{ id: "grammar", name: "Grammar", ur: "گرامر" }],
      physics: [{ id: "electricity", name: "Electricity", ur: "بجلی" }],
      math: [{ id: "trigonometry", name: "Trigonometry", ur: "تثلیث" }],
      chemistry: [{ id: "acids", name: "Acids & Bases", ur: "تیزاب اور بیس" }],
    },
  };

  const selection = { classLevel: null, subject: null, chapter: null };

  function navigate(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) target.classList.add("active");
    window.scrollTo(0, 0);
    // Lazy-render data screens only when shown (Task 11: avoid work until needed).
    if (screenId === "dashboard") window.Dashboard.render();
    if (screenId === "progress") window.Progress.render();
    if (screenId === "leaderboard") window.Leaderboard.render();
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2500);
  }

  // ---- Render subject list ----
  function renderSubjects() {
    const list = document.getElementById("subjectList");
    list.innerHTML = "";
    const lang = window.I18N.getLang();
    SUBJECTS[selection.classLevel].forEach((subj) => {
      const btn = document.createElement("button");
      btn.className = "card-select";
      btn.innerHTML = `<span class="card-label">${lang === "ur" ? subj.ur : subj.name}</span>`;
      btn.addEventListener("click", () => {
        selection.subject = subj.id;
        renderChapters();
        navigate("chapterSelect");
      });
      list.appendChild(btn);
    });
  }

  // ---- Render chapter list ----
  function renderChapters() {
    const list = document.getElementById("chapterList");
    list.innerHTML = "";
    const lang = window.I18N.getLang();
    const chapters = CHAPTERS[selection.classLevel][selection.subject] || [];
    chapters.forEach((ch) => {
      const btn = document.createElement("button");
      btn.className = "card-select";
      btn.innerHTML = `<span class="card-label">${lang === "ur" ? ch.ur : ch.name}</span>`;
      btn.addEventListener("click", () => {
        selection.chapter = ch.id;
        renderQuizConfig();
        navigate("quizConfig");
      });
      list.appendChild(btn);
    });
  }

  // ---- Render quiz config (number of questions) ----
  function renderQuizConfig() {
    const sel = document.getElementById("numQuestions");
    sel.innerHTML = "";
    [5, 10, 15, 20].forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      sel.appendChild(opt);
    });
  }

  // ---- Bind global events ----
  function bindEvents() {
    document.getElementById("guestBtn").addEventListener("click", () => navigate("classSelect"));
    document.getElementById("loginBtn").addEventListener("click", () => navigate("auth"));

    document.getElementById("langToggle").addEventListener("click", () => {
      const next = window.I18N.getLang() === "en" ? "ur" : "en";
      window.I18N.setLang(next);
      // re-render dynamic lists if visible
      if (document.getElementById("subjectSelect").classList.contains("active")) renderSubjects();
      if (document.getElementById("chapterSelect").classList.contains("active")) renderChapters();
    });

    // Back buttons
    document.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.target));
    });

    // Class selection
    document.querySelectorAll("#classSelect .card-select").forEach((btn) => {
      btn.addEventListener("click", () => {
        selection.classLevel = btn.dataset.class;
        renderSubjects();
        navigate("subjectSelect");
      });
    });

    // Start quiz
    document.getElementById("startQuizBtn").addEventListener("click", async () => {
      const count = parseInt(document.getElementById("numQuestions").value, 10);
      const difficulty = document.getElementById("difficulty").value;
      toast(window.I18N.t("loading"));
      try {
        await window.Quiz.start({
          classLevel: selection.classLevel,
          subject: selection.subject,
          chapter: selection.chapter,
          count,
          difficulty,
        });
      } catch (err) {
        toast(err.message || "Error loading questions");
      }
    });

    // Quiz controls
    document.getElementById("skipBtn").addEventListener("click", () => window.Quiz.skip());
    document.getElementById("nextBtn").addEventListener("click", () => window.Quiz.next());

    // Results controls
    document.getElementById("toDashboardBtn").addEventListener("click", () => navigate("dashboard"));
    document.getElementById("retryBtn").addEventListener("click", () => navigate("quizConfig"));

    // Dashboard -> Progress / Leaderboard
    document.getElementById("toProgressBtn").addEventListener("click", () => navigate("progress"));
    document.getElementById("toLeaderboardBtn").addEventListener("click", () => navigate("leaderboard"));

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      window.Auth.logout();
      navigate("welcome");
    });
  }

  function init() {
    window.I18N.setLang(window.I18N.getLang());
    window.Auth.init();
    bindEvents();
  }

  window.App = { navigate, toast, init };
  document.addEventListener("DOMContentLoaded", init);
})();