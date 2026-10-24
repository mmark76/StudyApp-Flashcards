"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const rootDir = path.resolve(__dirname, "..");
function runtime() {
  const saved = new Map();
  const win = { localStorage: {
    getItem(key) { return saved.get(key) ?? null; },
    setItem(key, value) { saved.set(key, value); }
  }};
  const context = { window: win, Blob, URL, document: {} };
  for (const file of ["decks.js", "storage.js", "scheduler.js"]) {
    vm.runInNewContext(fs.readFileSync(path.join(rootDir, "src", file), "utf8"), context);
  }
  return { win, saved };
}
test("Deep follows StudyApp first-review intervals and progress", () => {
  const { win } = runtime();
  const start = new Date("2026-10-24T12:00:00.000Z");
  const a = win.StudyFlashcardsSchedule.schedule(undefined, 0, start);
  const b = win.StudyFlashcardsSchedule.schedule(undefined, 1, start);
  const c = win.StudyFlashcardsSchedule.schedule(undefined, 2, start);
  assert.equal(a.nextReviewAt, "2026-10-24T12:10:00.000Z");
  assert.equal(b.intervalDays, 1);
  assert.equal(c.intervalDays, 3);
  assert.equal(c.nextReviewAt, "2026-10-27T12:00:00.000Z");
  assert.equal(a.lapses, 1);
  assert.equal(win.StudyFlashcardsSchedule.schedule(c, 2, start).intervalDays, 8);
});
test("Deep due queue excludes future cards and selects due/unseen ones", () => {
  const { win } = runtime();
  const deck = win.StudyFlashcardsDecks[0];
  const now = new Date("2026-10-24T12:00:00.000Z");
  const future = win.StudyFlashcardsSchedule.schedule(undefined, 2, now);
  const progress = { [deck.id]: { [deck.cards[0].id]: { deep: future } } };
  assert.equal(win.StudyFlashcardsSchedule.dueCards(deck, progress, now).length, 19);
  assert.equal(win.StudyFlashcardsSchedule.nextDueAt(deck, progress, now), future.nextReviewAt);
  assert.equal(win.StudyFlashcardsSchedule.dueCards(deck, progress, new Date(future.nextReviewAt)).length, 20);
});
test("previous Quick progress survives Deep scheduling and backup normalization", () => {
  const { win } = runtime();
  const deck = win.StudyFlashcardsDecks[0];
  const id = deck.cards[0].id;
  const previous = { last: "again", known: 4, again: 2 };
  const deep = win.StudyFlashcardsSchedule.schedule(undefined, 2, new Date("2026-10-24T12:00:00.000Z"));
  const input = { schemaVersion: 1, progress: { [deck.id]: { [id]: { ...previous, deep } } } };
  const normalized = win.StudyFlashcardsStorage.normalize(input, [deck]);
  assert.equal(normalized[deck.id][id].known, 4);
  assert.equal(normalized[deck.id][id].deep.intervalDays, 3);
  assert.equal(win.StudyFlashcardsStorage.save(normalized), true);
  assert.equal(win.StudyFlashcardsStorage.load([deck]).progress[deck.id][id].again, 2);
  assert.equal(win.StudyFlashcardsStorage.load([deck]).progress[deck.id][id].deep.score, 2);
});
test("corrupt Deep progress cannot be restored into storage", () => {
  const { win } = runtime();
  const deck = win.StudyFlashcardsDecks[0];
  const id = deck.cards[0].id;
  assert.throws(() => win.StudyFlashcardsStorage.normalize({
    schemaVersion: 1, progress: { [deck.id]: { [id]: { deep: { score: 9 } } } }
  }, [deck]), /Invalid Deep review record/);
});
