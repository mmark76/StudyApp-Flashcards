"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(rootDir, "src", name), "utf8");

function createRuntime(withInterface = false) {
  const memory = new Map();
  const localStorage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value)
  };
  const window = { localStorage, confirm: () => true };
  const elements = new Map();
  const handlers = new Map();
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        textContent: "",
        hidden: false,
        value: "",
        style: {},
        attributes: {},
        children: [],
        listeners: {},
        classList: { toggle() {} },
        appendChild(child) { this.children.push(child); },
        setAttribute(key, value) { this.attributes[key] = value; },
        addEventListener(key, callback) { this.listeners[key] = callback; },
        click() { this.clicked = (this.clicked || 0) + 1; this.listeners.click?.(); }
      });
    }
    return elements.get(id);
  }
  const document = {
    getElementById: element,
    createElement: () => element(`created-${elements.size}`),
    addEventListener: (name, handler) => handlers.set(name, handler)
  };
  const context = { window, document };
  vm.runInNewContext(read("decks.js"), context, { filename: "decks.js" });
  vm.runInNewContext(read("storage.js"), context, { filename: "storage.js" });
  if (withInterface) vm.runInNewContext(read("app.js"), context, { filename: "app.js" });
  return { window, element, handlers, memory };
}

test("the COS512 deck contains 20 valid and uniquely identified terms", () => {
  const { window } = createRuntime();
  const [deck] = window.StudyFlashcardsDecks;
  assert.equal(deck.id, "cos512");
  assert.equal(deck.cards.length, 20);
  assert.equal(new Set(deck.cards.map((card) => card.id)).size, 20);
  for (const card of deck.cards) {
    for (const field of ["id", "term", "en", "el", "example", "distinction"]) {
      assert.ok(typeof card[field] === "string" && card[field].trim(), `${card.id}: ${field}`);
    }
  }
});

test("progress saves and loads with the current schema", () => {
  const { window } = createRuntime();
  const storage = window.StudyFlashcardsStorage;
  const progress = { cos512: { "training-dataset": { last: "known", known: 2, again: 1 } } };
  assert.equal(storage.save(progress), true);
  const restored = storage.load(window.StudyFlashcardsDecks);
  assert.equal(restored.warning, "");
  assert.equal(restored.progress.cos512["training-dataset"].known, 2);
});

test("backup validation ignores unknown IDs and sanitizes invalid counters", () => {
  const { window } = createRuntime();
  const input = {
    schemaVersion: 1,
    progress: { cos512: {
      "training-dataset": { last: "again", known: -5, again: 3 },
      "not-a-real-card": { last: "known", known: 99, again: 0 },
      "class-label": { last: "unknown", known: 10, again: 0 }
    }, malicious: { arbitrary: { last: "known", known: 1 } } }
  };
  const valid = window.StudyFlashcardsStorage.normalize(input, window.StudyFlashcardsDecks);
  assert.equal(valid.cos512["training-dataset"].known, 0);
  assert.equal(valid.cos512["training-dataset"].again, 3);
  assert.equal(Object.hasOwn(valid.cos512, "not-a-real-card"), false);
  assert.equal(Object.hasOwn(valid.cos512, "class-label"), false);
  assert.equal(Object.hasOwn(valid, "malicious"), false);
});

test("unknown backup versions are rejected", () => {
  const { window } = createRuntime();
  assert.throws(() => window.StudyFlashcardsStorage.normalize({ schemaVersion: 2, progress: {} }, window.StudyFlashcardsDecks), /Unsupported backup version/);
});

test("revealing and grading cards advances the session and persists the result", () => {
  const runtime = createRuntime(true);
  const { element, window } = runtime;
  assert.equal(element("card-term").textContent, "Training Dataset");
  element("reveal-btn").click();
  assert.equal(element("answer-side").hidden, false);
  element("again-btn").click();
  assert.equal(element("card-term").textContent, "Class Label");
  element("reveal-btn").click();
  element("know-btn").click();
  element("reveal-btn").click();
  element("know-btn").click();
  assert.equal(element("card-term").textContent, "Training Dataset");
  assert.equal(element("session-count").textContent, "2 / 20 mastered");
  const state = window.StudyFlashcardsStorage.load(window.StudyFlashcardsDecks).progress;
  assert.equal(state.cos512["training-dataset"].last, "again");
  assert.equal(state.cos512["class-label"].last, "known");
});

test("restore uses a keyboard-accessible button to open the local file picker", () => {
  const { element } = createRuntime(true);
  assert.equal(element("import-input").clicked, undefined);
  element("restore-btn").click();
  assert.equal(element("import-input").clicked, 1);
});
