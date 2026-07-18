// progress.js — Student progress page (Task 5)
// Reads the same result list used by the dashboard (guest localStorage or
// Supabase quiz_results) and derives: average/best score, weak/strong
// subjects with progress bars, completed chapters, current streak, total
// quizzes, and average time.
(function () {
  "use strict";

  function statCard(value, label) {
    return `<div class="stat"><div class="stat-val">${value}</div><div class="stat-label">${label}</div></div>`;
  }

  function subjectBar(name, acc) {
    const pct = Math.round(acc * 100);
    const cls = pct >= 70 ? "good" : pct >= 40 ? "mid" : "low";
    return `
      <div class="subject-bar">
        <div class="subject-bar-head">
          <span>${name}</span><span>${pct}%</span>
        </div>
        <div class="subject-bar-track">
          <div class="subject-bar-fill ${cls}" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  async function render() {
    const results = await window.Storage.getResults();
    const statsEl = document.getElementById("progressStats");
    const barsEl = document.getElementById("subjectBars");
    const chaptersEl = document.getElementById("completedChapters");

    if (!results || results.length === 0) {
      statsEl.innerHTML = "";
      barsEl.innerHTML = `<p class="msg">${window.I18N.t("no_data")}</p>`;
      chaptersEl.innerHTML = "";
      return;
    }

    const totalQuizzes = results.length;
    const totalCorrect = results.reduce((s, r) => s + (r.score || 0), 0);
    const totalMCQs = results.reduce((s, r) => s + (r.total || 0), 0);
    const avgScore = totalMCQs ? Math.round((totalCorrect / totalMCQs) * 100) : 0;
    const bestScore = results.reduce((m, r) => Math.max(m, r.score || 0), 0);
    const avgTime = Math.round(
      results.reduce((s, r) => s + (r.time_taken || r.timeTaken || 0), 0) / totalQuizzes
    );
    const streak = window.Storage.getStreak().count;

    statsEl.innerHTML =
      statCard(avgScore + "%", window.I18N.t("avg_score")) +
      statCard(bestScore, window.I18N.t("best_score")) +
      statCard(avgTime + "s", window.I18N.t("avg_time")) +
      statCard(streak, window.I18N.t("current_streak")) +
      statCard(totalQuizzes, window.I18N.t("total_quizzes"));

    // Subject accuracy
    const bySubject = {};
    results.forEach((r) => {
      const subj = r.subject || r.quiz_id || "General";
      if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0 };
      bySubject[subj].correct += r.score || 0;
      bySubject[subj].total += r.total || 0;
    });
    const entries = Object.entries(bySubject).map(([name, v]) => ({
      name,
      acc: v.total ? v.correct / v.total : 0,
    }));
    entries.sort((a, b) => b.acc - a.acc);
    barsEl.innerHTML = entries.map((e) => subjectBar(e.name, e.acc)).join("");

    // Completed chapters (unique chapter identifiers)
    const completed = {};
    results.forEach((r) => {
      const key = r.chapter || r.quiz_id || "—";
      completed[key] = (completed[key] || 0) + 1;
    });
    chaptersEl.innerHTML = Object.entries(completed)
      .map(
        ([ch, n]) =>
          `<div class="history-item"><span>${ch}</span><span>${n} ${window.I18N.t("total_quizzes").toLowerCase()}</span></div>`
      )
      .join("");
  }

  window.Progress = { render };
})();