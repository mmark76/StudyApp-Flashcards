/* Storage and backup logic: independent of presentation and card order. */
(function registerStorage(root) {
  "use strict";
  const KEY = "studyapp-flashcards-progress-v1";
  const SCHEMA_VERSION = 1;
  const APP_VERSION = "0.2.0";

  function normalizeDeep(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Invalid Deep review record.");
    }
    if (![0, 1, 2].includes(value.score)
        || !Number.isSafeInteger(value.repetitions) || value.repetitions < 1 || value.repetitions > 1000000
        || !Number.isSafeInteger(value.intervalDays) || value.intervalDays < 0 || value.intervalDays > 180
        || !Number.isSafeInteger(value.lapses) || value.lapses < 0 || value.lapses > value.repetitions
        || typeof value.lastReviewedAt !== "string" || !Number.isFinite(Date.parse(value.lastReviewedAt))
        || typeof value.nextReviewAt !== "string" || !Number.isFinite(Date.parse(value.nextReviewAt))) {
      throw new Error("Invalid Deep review record.");
    }
    return {
      score: value.score,
      repetitions: value.repetitions,
      intervalDays: value.intervalDays,
      nextReviewAt: value.nextReviewAt,
      lastReviewedAt: value.lastReviewedAt,
      lapses: value.lapses
    };
  }

  function normalize(raw, decks) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid backup format.");
    if (raw.schemaVersion !== SCHEMA_VERSION) throw new Error("Unsupported backup version.");
    const source = raw.progress;
    if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("Invalid progress data.");
    const result = Object.create(null);

    for (const deck of decks) {
      const input = source[deck.id];
      if (!input || typeof input !== "object" || Array.isArray(input)) continue;
      const cleaned = Object.create(null);
      for (const card of deck.cards) {
        const entry = input[card.id];
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
        const hasQuick = entry.last === "known" || entry.last === "again";
        const hasDeep = Object.prototype.hasOwnProperty.call(entry, "deep");
        if (!hasQuick && !hasDeep) continue;
        cleaned[card.id] = {
          ...(hasQuick ? {
            last: entry.last,
            known: boundedCount(entry.known),
            again: boundedCount(entry.again)
          } : {}),
          ...(hasDeep ? { deep: normalizeDeep(entry.deep) } : {})
        };
      }
      result[deck.id] = cleaned;
    }
    return result;
  }

  function boundedCount(value) {
    return Number.isSafeInteger(value) && value >= 0 && value <= 1000000 ? value : 0;
  }

  function load(decks) {
    try {
      const text = root.localStorage.getItem(KEY);
      return { progress: text ? normalize(JSON.parse(text), decks) : Object.create(null), warning: "" };
    } catch (_error) {
      return { progress: Object.create(null), warning: "Saved progress is unavailable in this browser." };
    }
  }

  function save(progress) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, progress }));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function backup(progress) {
    const exportedAt = new Date().toISOString();
    const content = JSON.stringify({ schemaVersion: SCHEMA_VERSION, appVersion: APP_VERSION, exportedAt, progress }, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StudyApp-Flashcards-progress-v${APP_VERSION}-${exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  root.StudyFlashcardsStorage = { load, save, normalize, backup, schemaVersion: SCHEMA_VERSION };
})(window);
