"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "src", "appearance.js"), "utf8");
const page = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function mount({ savedMode, storageBroken = false } = {}) {
  const preferences = new Map();
  if (savedMode !== undefined) preferences.set("studyapp-flashcards-appearance", savedMode);
  const rootAttributes = {};
  const buttonAttributes = {};
  const button = {
    textContent: "",
    listeners: {},
    setAttribute(name, value) { buttonAttributes[name] = value; },
    addEventListener(name, callback) { this.listeners[name] = callback; }
  };
  const document = {
    documentElement: { setAttribute(name, value) { rootAttributes[name] = value; } },
    getElementById(id) { return id === "theme-toggle" ? button : null; }
  };
  const window = {
    document,
    localStorage: {
      getItem(name) {
        if (storageBroken) throw new Error("Storage denied");
        return preferences.get(name) ?? null;
      },
      setItem(name, value) {
        if (storageBroken) throw new Error("Storage denied");
        preferences.set(name, value);
      }
    }
  };
  vm.runInNewContext(source, { window }, { filename: "appearance.js" });
  return { preferences, rootAttributes, buttonAttributes, button };
}

test("Flashcards begins in light mode and offers dark mode", () => {
  const app = mount();
  assert.equal(app.rootAttributes["data-appearance"], "light");
  assert.equal(app.button.textContent, "Dark");
  assert.equal(app.buttonAttributes["aria-pressed"], "false");
});

test("an existing dark preference is restored and can be switched", () => {
  const app = mount({ savedMode: "dark" });
  assert.equal(app.rootAttributes["data-appearance"], "dark");
  assert.equal(app.button.textContent, "Light");
  assert.equal(app.buttonAttributes["aria-label"], "Switch to light mode");
  app.button.listeners.click();
  assert.equal(app.rootAttributes["data-appearance"], "light");
  assert.equal(app.preferences.get("studyapp-flashcards-appearance"), "light");
});

test("an invalid stored mode and blocked storage fail safely", () => {
  assert.equal(mount({ savedMode: "unexpected" }).rootAttributes["data-appearance"], "light");
  const app = mount({ storageBroken: true });
  app.button.listeners.click();
  assert.equal(app.rootAttributes["data-appearance"], "dark");
});

test("the header offers real return paths and the appearance module", () => {
  assert.match(page, /href="https:\/\/studyapp\.markellosecosystem\.com\/#\/workspace-beta"/);
  assert.match(page, /href="https:\/\/markellosecosystem\.com\/"/);
  assert.match(page, /id="theme-toggle"/);
  assert.match(page, /src="src\/appearance\.js"/);
});
