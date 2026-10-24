/* Shared scheduling policy for Deep sessions, adapted from the StudyApp rules. */
(function registerSchedule(root) {
  "use strict";
  const MAX_INTERVAL_DAYS = 180;
  const DAY_MS = 24 * 60 * 60 * 1000;

  function schedule(previous, rating, now = new Date()) {
    if (![0, 1, 2].includes(rating) || !Number.isFinite(now.getTime())) {
      throw new Error("Invalid Deep review rating or time.");
    }
    const repetitions = (previous?.repetitions || 0) + 1;
    let lapses = previous?.lapses || 0;
    let intervalDays = 0;
    let nextReviewAt;
    if (rating === 0) {
      lapses += 1;
      nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000);
    } else if (rating === 1) {
      intervalDays = previous?.intervalDays
        ? Math.max(1, Math.round(previous.intervalDays * 1.8))
        : 1;
      intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);
      nextReviewAt = new Date(now.getTime() + intervalDays * DAY_MS);
    } else {
      intervalDays = previous?.intervalDays
        ? Math.max(3, Math.round(previous.intervalDays * 2.5))
        : repetitions === 1 ? 3 : 7;
      intervalDays = Math.min(intervalDays, MAX_INTERVAL_DAYS);
      nextReviewAt = new Date(now.getTime() + intervalDays * DAY_MS);
    }
    return {
      score: rating, repetitions, intervalDays,
      nextReviewAt: nextReviewAt.toISOString(),
      lastReviewedAt: now.toISOString(), lapses
    };
  }

  function dueCards(deck, progress, now = new Date()) {
    const records = progress?.[deck.id] || {};
    return deck.cards.filter((card) => {
      const review = records[card.id]?.deep;
      return !review || new Date(review.nextReviewAt) <= now;
    });
  }

  function nextDueAt(deck, progress, now = new Date()) {
    const records = progress?.[deck.id] || {};
    const timestamps = deck.cards.map(card => records[card.id]?.deep?.nextReviewAt)
      .filter(Boolean).map(value => new Date(value).getTime())
      .filter(value => Number.isFinite(value) && value > now.getTime());
    return timestamps.length ? new Date(Math.min(...timestamps)).toISOString() : null;
  }

  root.StudyFlashcardsSchedule = { schedule, dueCards, nextDueAt };
})(window);
