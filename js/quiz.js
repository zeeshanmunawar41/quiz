// quiz.js — Quiz engine: load questions, shuffle, timer, scoring, review
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;

  let state = null; // active quiz state
  let timerId = null;

  // ---- Question loading ----
  async function loadQuestions(classLevel, subject, chapter) {
    const path = `questions/${classLevel}/${subject}/${chapter}.json`;
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path);
    const data = await res.json();
    return data.questions || [];
  }

  // ---- Shuffle helpers ----
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function shuffleOptions(q) {
    const opts = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }));
    const shuffled = shuffle(opts);
    return {
      options: shuffled.map((o) => o.text),
      correctIndex: shuffled.findIndex((o) => o.isCorrect),
    };
  }

  // ---- Build a quiz set ----
  function buildQuizSet(allQuestions, count, difficulty) {
    let pool = allQuestions;
    if (difficulty && difficulty !== "all") {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }
    pool = shuffle(pool);
    if (count && count < pool.length) pool = pool.slice(0, count);
    return pool.map((q) => {
      const sh = shuffleOptions(q);
      return {
        question: q.question,
        questionUr: q.questionUr || "",
        options: sh.options,
        correctIndex: sh.correctIndex,
        explanation: q.explanation || "",
        explanationUr: q.explanationUr || "",
        difficulty: q.difficulty || "Easy",
        subject: q.subject || "",
      };
    });
  }

  // ---- Start a quiz ----
  async function start(meta) {
    const all = await loadQuestions(meta.classLevel, meta.subject, meta.chapter);
    const set = buildQuizSet(all, meta.count, meta.difficulty);
    state = {
      meta,
      questions: set,
      current: 0,
      answers: new Array(set.length).fill(null), // index selected or null if skipped
      startTime: Date.now(),
      finished: false,
    };
    renderQuestion();
    window.App.navigate("quiz");
    startTimer();
  }

  function startTimer() {
    stopTimer();
    let remaining = CFG.TIME_PER_QUESTION;
    updateTimerDisplay(remaining);
    timerId = setInterval(() => {
      remaining--;
      updateTimerDisplay(remaining);
      if (remaining <= 0) {
        stopTimer();
        window.App.toast(window.I18N.t("time_up"));
        next(); // auto-submit current
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function updateTimerDisplay(sec) {
    const el = document.getElementById("timer");
    el.textContent = sec;
    el.classList.toggle("danger", sec <= 10);
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    const lang = window.I18N.getLang();
    const qText = lang === "ur" && q.questionUr ? q.questionUr : q.question;
    document.getElementById("questionBox").textContent = qText;

    const optsBox = document.getElementById("optionsBox");
    optsBox.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = opt;
      if (state.answers[state.current] === idx) btn.classList.add("selected");
      btn.addEventListener("click", () => selectOption(idx));
      optsBox.appendChild(btn);
    });

    document.getElementById("qCounter").textContent =
      `${state.current + 1}/${state.questions.length}`;
    const pct = ((state.current) / state.questions.length) * 100;
    document.getElementById("progressBar").style.width = pct + "%";

    const nextBtn = document.getElementById("nextBtn");
    nextBtn.textContent =
      state.current === state.questions.length - 1 ? window.I18N.t("results_title") : window.I18N.t("next");
  }

  function selectOption(idx) {
    state.answers[state.current] = idx;
    const opts = document.querySelectorAll("#optionsBox .option");
    opts.forEach((o, i) => o.classList.toggle("selected", i === idx));
  }

  function skip() {
    state.answers[state.current] = null;
    next();
  }

  function next() {
    if (state.current < state.questions.length - 1) {
      state.current++;
      startTimer();
      renderQuestion();
    } else {
      finish();
    }
  }

  function finish() {
    stopTimer();
    state.finished = true;
    const total = state.questions.length;
    let score = 0;
    state.questions.forEach((q, i) => {
      if (state.answers[i] === q.correctIndex) score++;
    });
    const timeTaken = Math.round((Date.now() - state.startTime) / 1000);

    const result = {
      quizId: `${state.meta.classLevel}-${state.meta.subject}-${state.meta.chapter}`,
      classLevel: state.meta.classLevel,
      subject: state.meta.subject,
      chapter: state.meta.chapter,
      score,
      total,
      timeTaken,
      takenAt: new Date().toISOString(),
      answers: state.answers,
    };

    window.Storage.updateStreak();
    window.Storage.saveResult(result);
    renderResults(result);
    window.App.navigate("results");
  }

  function renderResults(result) {
    const lang = window.I18N.getLang();
    const pct = Math.round((result.score / result.total) * 100);
    document.getElementById("resultSummary").innerHTML = `
      <div class="score">${result.score}/${result.total}</div>
      <p>${window.I18N.t("accuracy")}: <strong>${pct}%</strong></p>
      <p>${window.I18N.t("total_mcqs")}: <strong>${result.total}</strong></p>
      <p>${window.I18N.t("time_taken")}: <strong>${result.timeTaken}s</strong></p>
    `;

    const review = document.getElementById("reviewBox");
    review.innerHTML = "";
    state.questions.forEach((q, i) => {
      const chosen = state.answers[i];
      const isCorrect = chosen === q.correctIndex;
      const isSkipped = chosen === null;
      const item = document.createElement("div");
      item.className = "review-item " + (isSkipped ? "skipped" : isCorrect ? "correct" : "wrong");
      const qText = lang === "ur" && q.questionUr ? q.questionUr : q.question;
      const correctText = q.options[q.correctIndex];
      const chosenText = isSkipped ? "—" : q.options[chosen];
      const expl = lang === "ur" && q.explanationUr ? q.explanationUr : q.explanation;
      item.innerHTML = `
        <div class="review-q">${i + 1}. ${qText}</div>
        <div class="review-a">${window.I18N.t("your_answer")}: ${chosenText}</div>
        <div class="review-a">${window.I18N.t("correct_answer")}: ${correctText}</div>
        ${expl ? `<div class="explanation">${expl}</div>` : ""}
      `;
      review.appendChild(item);
    });
  }

  function getState() {
    return state;
  }

  window.Quiz = { start, skip, next, selectOption, getState };
})();