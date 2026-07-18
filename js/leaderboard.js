// leaderboard.js — Global leaderboard (Task 6)
// Ranks students by highest percentage, then best score, then fastest time.
// Only the highest attempt per chapter counts (dedupe by user+chapter).
// In guest mode there is no shared data, so we show a friendly note.
(function () {
  "use strict";

  async function render() {
    const listEl = document.getElementById("leaderboardList");
    const client = window.Storage.getClient();
    const session = window.Storage.getSession();

    // Guest mode: no shared leaderboard data.
    if (!client || !session || !session.user) {
      listEl.innerHTML = `<p class="msg">${window.I18N.t("no_leaderboard")}</p>`;
      return;
    }

    // Fetch all results, then keep the best attempt per (user, chapter).
    const { data, error } = await client
      .from("quiz_results")
      .select("user_id, chapter, score, total, percentage, time_taken")
      .order("percentage", { ascending: false });

    if (error) {
      listEl.innerHTML = `<p class="msg error">${error.message}</p>`;
      return;
    }
    if (!data || data.length === 0) {
      listEl.innerHTML = `<p class="msg">${window.I18N.t("no_leaderboard")}</p>`;
      return;
    }

    // Dedupe: best attempt per user+chapter.
    const best = {};
    data.forEach((row) => {
      const key = row.user_id + "|" + (row.chapter || "?");
      const cur = best[key];
      if (!cur || row.percentage > cur.percentage ||
         (row.percentage === cur.percentage && row.time_taken < cur.time_taken)) {
        best[key] = row;
      }
    });

    // Rank by percentage desc, score desc, time asc.
    const ranked = Object.values(best).sort((a, b) =>
      b.percentage - a.percentage ||
      b.score - a.score ||
      a.time_taken - b.time_taken
    );

    listEl.innerHTML = ranked
      .map((row, i) => {
        const initial = (row.user_id || "?").slice(0, 4).toUpperCase();
        return `
          <div class="leaderboard-row">
            <span class="lb-rank">#${i + 1}</span>
            <span class="lb-name">${window.I18N.t("student")} ${initial}</span>
            <span class="lb-chapter">${row.chapter || ""}</span>
            <span class="lb-pct">${row.percentage}%</span>
            <span class="lb-meta">${row.score}/${row.total} · ${row.time_taken}s</span>
          </div>`;
      })
      .join("");
  }

  window.Leaderboard = { render };
})();