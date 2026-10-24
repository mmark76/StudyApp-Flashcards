/* Flashcards-only appearance preference. It does not alter learning data. */
(function startAppearance(root) {
  "use strict";

  const key = "studyapp-flashcards-appearance";
  const document = root.document;
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  function storedMode() {
    try {
      return root.localStorage.getItem(key) === "dark" ? "dark" : "light";
    } catch (_error) {
      return "light";
    }
  }

  function applyMode(mode) {
    const dark = mode === "dark";
    document.documentElement.setAttribute("data-appearance", dark ? "dark" : "light");
    toggle.textContent = dark ? "Light" : "Dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  let mode = storedMode();
  applyMode(mode);

  toggle.addEventListener("click", () => {
    mode = mode === "dark" ? "light" : "dark";
    applyMode(mode);
    try {
      root.localStorage.setItem(key, mode);
    } catch (_error) {
      // Continue with the current visual preference if storage is blocked.
    }
  });
})(window);
