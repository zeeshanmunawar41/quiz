// i18n.js — Bilingual (English / Urdu) string management
(function () {
  "use strict";

  const STRINGS = {
    en: {
      welcome_title: "Welcome to the Quiz Platform",
      welcome_sub: "Practice MCQs for Class 9 & 10 — English & Urdu",
      continue_guest: "Continue as Guest",
      login: "Login / Register",
      auth_title: "Student Login",
      email: "Email",
      password: "Password",
      need_account: "Need an account? Register",
      have_account: "Have an account? Login",
      back: "Back",
      choose_class: "Choose Your Class",
      class_9: "Class 9",
      class_10: "Class 10",
      choose_subject: "Choose Subject",
      choose_chapter: "Choose Chapter",
      quiz_settings: "Quiz Settings",
      num_questions: "Number of Questions",
      difficulty: "Difficulty",
      diff_all: "All",
      diff_easy: "Easy",
      diff_medium: "Medium",
      diff_hard: "Hard",
      start_quiz: "Start Quiz",
      skip: "Skip",
      next: "Next",
      results_title: "Results",
      view_dashboard: "View Dashboard",
      retry: "Retry",
      dashboard_title: "Dashboard",
      quiz_history: "Quiz History",
      logout: "Logout",
      back_home: "Back Home",
      correct: "Correct",
      wrong: "Wrong",
      skipped: "Skipped",
      your_answer: "Your answer",
      correct_answer: "Correct answer",
      accuracy: "Accuracy",
      best_subject: "Best Subject",
      weakest_subject: "Weakest Subject",
      total_quizzes: "Total Quizzes",
      total_mcqs: "MCQs Solved",
      last_quiz: "Last Quiz",
      overall_accuracy: "Overall Accuracy",
      no_history: "No quiz history yet. Take a quiz!",
      streak: "Day Streak",
      guest_mode: "Guest mode — results are saved locally only.",
      logged_in_as: "Logged in as",
      time_up: "Time's up!",
      quiz_complete: "Quiz complete!",
      loading: "Loading...",
      time_taken: "Time Taken",
      view_progress: "Progress",
      view_leaderboard: "Leaderboard",
      progress_title: "My Progress",
      weak_strong: "Weak & Strong Subjects",
      completed_chapters: "Completed Chapters",
      leaderboard_title: "Leaderboard",
      leaderboard_note: "Best attempt per chapter counts. Ranked by percentage, then score, then speed.",
      avg_score: "Average Score",
      best_score: "Best Score",
      avg_time: "Average Time",
      current_streak: "Current Streak",
      total_quizzes: "Total Quizzes",
      no_data: "No data yet. Complete a quiz!",
      rank: "Rank",
      student: "Student",
      percentage: "Percentage",
      no_leaderboard: "Leaderboard will appear after students take quizzes.",
    },
    ur: {
      welcome_title: "کوئز پلیٹ فارم میں خوش آمدید",
      welcome_sub: "جماعت 9 اور 10 کے لیے ایم سی کیوز — انگریزی اور اردو",
      continue_guest: "مہمان کے طور پر جاری رکھیں",
      login: "لاگ ان / رجسٹر",
      auth_title: "طالب علم لاگ ان",
      email: "ای میل",
      password: "پاس ورڈ",
      need_account: "اکاؤنٹ چاہیے؟ رجسٹر کریں",
      have_account: "اکاؤنٹ ہے؟ لاگ ان کریں",
      back: "واپس",
      choose_class: "اپنی جماعت منتخب کریں",
      class_9: "جماعت 9",
      class_10: "جماعت 10",
      choose_subject: "مضمون منتخب کریں",
      choose_chapter: "باب منتخب کریں",
      quiz_settings: "کوئز کی ترتیبات",
      num_questions: "سوالات کی تعداد",
      difficulty: "مشکل درجہ",
      diff_all: "تمام",
      diff_easy: "آسان",
      diff_medium: "درمیانہ",
      diff_hard: "مشکل",
      start_quiz: "کوئز شروع کریں",
      skip: "چھوڑیں",
      next: "اگلا",
      results_title: "نتائج",
      view_dashboard: "ڈیش بورڈ دیکھیں",
      retry: "دوبارہ کوشش",
      dashboard_title: "ڈیش بورڈ",
      quiz_history: "کوئز کی تاریخ",
      logout: "لاگ آؤٹ",
      back_home: "ہوم واپس",
      correct: "درست",
      wrong: "غلط",
      skipped: "چھوڑا گیا",
      your_answer: "آپ کا جواب",
      correct_answer: "درست جواب",
      accuracy: "درستگی",
      best_subject: "بہترین مضمون",
      weakest_subject: "کمزور مضمون",
      total_quizzes: "کل کوئز",
      total_mcqs: "حل کیے گئے سوالات",
      last_quiz: "آخری کوئز",
      overall_accuracy: "مجموعی درستگی",
      no_history: "ابھی تک کوئی تاریخ نہیں۔ ایک کوئز دیں!",
      streak: "مسلسل دن",
      guest_mode: "مہمان موڈ — نتائج صرف مقامی طور پر محفوظ ہیں۔",
      logged_in_as: "لاگ ان بطور",
      time_up: "وقت ختم!",
      quiz_complete: "کوئز مکمل!",
      loading: "لوڈ ہو رہا ہے...",
      time_taken: "وقت لیا",
      view_progress: "پیشرفت",
      view_leaderboard: "لیڈر بورڈ",
      progress_title: "میری پیشرفت",
      weak_strong: "کمزور اور مضبوط مضامین",
      completed_chapters: "مکمل کیے گئے ابواب",
      leaderboard_title: "لیڈر بورڈ",
      leaderboard_note: "ہر باب کی بہترین کوشش شمار ہوتی ہے۔ فیصد، پھر اسکور، پھر رفتار سے درجہ بندی۔",
      avg_score: "اوسط اسکور",
      best_score: "بہترین اسکور",
      avg_time: "اوسط وقت",
      current_streak: "موجودہ مسلسل دن",
      total_quizzes: "کل کوئز",
      no_data: "ابھی کوئی ڈیٹا نہیں۔ ایک کوئز مکمل کریں!",
      rank: "درجہ",
      student: "طالب علم",
      percentage: "فیصد",
      no_leaderboard: "لیڈر بورڈ طلباء کے کوئز دینے کے بعد ظاہر ہوگا۔",
    },
  };

  let currentLang = localStorage.getItem(window.APP_CONFIG.STORAGE_KEYS.LANG) || "en";

  function t(key) {
    const dict = STRINGS[currentLang] || STRINGS.en;
    return dict[key] !== undefined ? dict[key] : key;
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(window.APP_CONFIG.STORAGE_KEYS.LANG, lang);
    document.documentElement.lang = lang;
    document.body.classList.toggle("ur", lang === "ur");
    applyTranslations();
  }

  function getLang() {
    return currentLang;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    const toggle = document.getElementById("langToggle");
    if (toggle) toggle.textContent = currentLang === "en" ? "اردو" : "EN";
  }

  window.I18N = { t, setLang, getLang, applyTranslations };
})();