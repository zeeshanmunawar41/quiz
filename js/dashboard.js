// dashboard.js — Student dashboard: stats, subject accuracy, history
(function () {
  "use strict";

  async function render() {
    const statsEl = document.getElementById("dashStats");
    const historyEl = document.getElementById("dashHistory");
    let results;
    try {
      results = await window.Storage.getResults();
    } catch (err) {
      // Task 12: network/database failure should not crash the dashboard.
      statsEl.innerHTML = "";
      historyEl.innerHTML = `<p class="msg error">${window.I18N.t("no_history")}</p>`;
      return;
    }

    if (!results || results.length === 0) {
      statsEl.innerHTML = "";
      historyEl.innerHTML = `<p class="msg">${window.I18N.t("no_history")}</p>`;
      return;
    }

    const totalQuizzes = results.length;
    const totalMCQs = results.reduce((s, r) => s + (r.total || 0), 0);
    const totalCorrect = results.reduce((s, r) => s + (r.score || 0), 0);
    const streak = window.Storage.getStreak().count;

    // Subject-wise accuracy
    const bySubject = {};
    results.forEach((r) => {
      const subj = r.subject || r.quizId || "General";
      if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0 };
      bySubject[subj].correct += r.score || 0;
      bySubject[subj].total += r.total || 0;
    });

    let best = null, weakest = null;
    Object.entries(bySubject).forEach(([subj, v]) => {
      const acc = v.total ? v.correct / v.total : 0;
      if (!best || acc > best.acc) best = { subj, acc };
      if (!weakest || acc < weakest.acc) weakest = { subj, acc };
    });

    const last = results[0];
    const lastDate = new Date(last.taken_at || last.takenAt).toLocaleDateString();

    // Use stored percentage when available (new schema), else compute.
    const overallAcc = results[0].percentage != null
      ? Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length)
      : (totalMCQs ? Math.round((totalCorrect / totalMCQs) * 100) : 0);

    statsEl.innerHTML = `
      ${statCard(overallAcc + "%", window.I18N.t("overall_accuracy"))}
      ${statCard(totalQuizzes, window.I18N.t("total_quizzes"))}
      ${statCard(totalMCQs, window.I18N.t("total_mcqs"))}
      ${statCard(streak, window.I18N.t("streak"))}
      ${statCard(best ? `${best.subj} (${Math.round(best.acc * 100)}%)` : "—", window.I18N.t("best_subject"))}
      ${statCard(weakest ? `${weakest.subj} (${Math.round(weakest.acc * 100)}%)` : "—", window.I18N.t("weakest_subject"))}
      ${statCard(lastDate, window.I18N.t("last_quiz"))}
    `;

    historyEl.innerHTML = results
      .slice(0, 20)
      .map((r) => {
        const date = new Date(r.taken_at || r.takenAt).toLocaleString();
        const label = r.subject || r.quizId || "Quiz";
        return `<div class="history-item">
          <span>${label}</span>
          <span>${r.score}/${r.total} · ${date}</span>
        </div>`;
      })
      .join("");
  }

  function statCard(value, label) {
    return `<div class="stat">
      <div class="stat-val">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
  }

  window.Dashboard = { render };
})();