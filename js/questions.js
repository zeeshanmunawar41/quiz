// questions.js — Question data source (Task 8 & 9)
// Single abstraction over where questions come from. Today it reads the
// JSON files in /questions. To migrate to Supabase later, flip
// CFG.QUESTIONS_SOURCE to "supabase" and implement loadFromSupabase();
// no other file needs to change because every consumer calls
// QuestionSource.load(classLevel, subject, chapter).
(function () {
  "use strict";

  const CFG = window.APP_CONFIG;

  // Normalize a raw JSON question (old shape) into the canonical shape used
  // by the quiz engine. This decouples the engine from the storage format.
  function normalize(jsonQuestions) {
    return jsonQuestions.map((q) => ({
      question: q.question,
      questionUr: q.questionUr || "",
      options: q.options,
      correctIndex: q.correctIndex,
      difficulty: q.difficulty || "Easy",
      explanation: q.explanation || "",
      explanationUr: q.explanationUr || "",
      subject: q.subject || "",
    }));
  }

  async function loadFromJson(classLevel, subject, chapter) {
    const path = `questions/${classLevel}/${subject}/${chapter}.json`;
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path);
    const data = await res.json();
    return normalize(data.questions || []);
  }

  // Placeholder for future Supabase-backed questions (Task 8).
  // The DB schema in data/supabase-schema.sql already supports this:
  // questions -> options (is_correct) -> chapters -> subjects.
  async function loadFromSupabase(classLevel, subject, chapter) {
    const client = window.Storage.getClient();
    if (!client) throw new Error("Supabase client not available");
    // Example mapping (subject/chapter names come from app.js catalogs):
    const { data, error } = await client
      .from("questions")
      .select("id, question_en, question_ur, difficulty, explanation_en, explanation_ur, options(id, option_en, option_ur, is_correct)")
      .eq("chapter_id", chapter);
    if (error) throw new Error(error.message);
    // Map DB rows -> engine shape (left for the migration step).
    return (data || []).map((row) => {
      const opts = row.options;
      const correctIdx = opts.findIndex((o) => o.is_correct);
      return {
        question: row.question_en,
        questionUr: row.question_ur || "",
        options: opts.map((o) => o.option_en),
        correctIndex: correctIdx,
        difficulty: row.difficulty,
        explanation: row.explanation_en || "",
        explanationUr: row.explanation_ur || "",
        subject,
      };
    });
  }

  async function load(classLevel, subject, chapter) {
    const source = CFG.QUESTIONS_SOURCE || "json";
    if (source === "supabase") return loadFromSupabase(classLevel, subject, chapter);
    return loadFromJson(classLevel, subject, chapter);
  }

  window.QuestionSource = { load };
})();