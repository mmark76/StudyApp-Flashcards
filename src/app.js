/* Application controller: presentation and study-session workflow only. */
(function startApplication(root) {
  "use strict";
  const decks = root.StudyFlashcardsDecks;
  const storage = root.StudyFlashcardsStorage;
  const byId = (id) => document.getElementById(id);

  if (!Array.isArray(decks) || !decks.length || !storage) {
    byId("card-term").textContent = "Flashcards are unavailable.";
    return;
  }

  const loaded = storage.load(decks);
  let progress = loaded.progress;
  let deck = decks[0];
  let queue = [];
  let current = null;
  let answerVisible = false;
  let knownThisSession = 0;

  function announce(message, error = false) {
    const notice = byId("notice");
    notice.textContent = message;
    notice.classList.toggle("error", error);
  }

  function currentProgress() {
    if (!progress[deck.id]) progress[deck.id] = Object.create(null);
    return progress[deck.id];
  }

  function orderCards() {
    const previous = currentProgress();
    const rank = (card) => previous[card.id]?.last === "again" ? 0 : previous[card.id]?.last === "known" ? 2 : 1;
    return [...deck.cards].sort((a, b) => rank(a) - rank(b));
  }

  function beginSession() {
    queue = orderCards();
    knownThisSession = 0;
    current = null;
    advance();
  }

  function advance() {
    current = queue.shift() || null;
    answerVisible = false;
    render();
  }

  function render() {
    const complete = !current;
    const remaining = queue.length + (complete ? 0 : 1);
    const fraction = Math.round((knownThisSession / deck.cards.length) * 100);

    byId("deck-details").textContent = `${deck.cards.length} terms · ${deck.description}`;
    byId("session-count").textContent = `${knownThisSession} / ${deck.cards.length} mastered`;
    byId("remaining-count").textContent = `${remaining} remaining`;
    byId("progress-meter").setAttribute("aria-valuenow", String(fraction));
    byId("progress-fill").style.width = `${fraction}%`;

    byId("question-side").hidden = complete || answerVisible;
    byId("answer-side").hidden = complete || !answerVisible;
    byId("done-side").hidden = !complete;
    byId("reveal-btn").hidden = complete || answerVisible;
    byId("skip-btn").hidden = complete;
    byId("grade-actions").hidden = complete || !answerVisible;
    byId("restart-btn").hidden = !complete;

    if (complete) return;
    byId("card-term").textContent = current.term;
    byId("answer-term").textContent = current.term;
    byId("answer-en").textContent = current.en;
    byId("answer-el").textContent = current.el;
    byId("answer-example").textContent = current.example;
    byId("answer-distinction").textContent = current.distinction || "";
    byId("distinction-block").hidden = !current.distinction;
  }

  function revealAnswer() {
    if (!current || answerVisible) return;
    answerVisible = true;
    render();
  }

  function skipCard() {
    if (!current) return;
    queue.push(current);
    advance();
  }

  function grade(result) {
    if (!current || !answerVisible || (result !== "known" && result !== "again")) return;
    const entry = currentProgress()[current.id] || { last: result, known: 0, again: 0 };
    entry[result] = (entry[result] || 0) + 1;
    entry.last = result;
    currentProgress()[current.id] = entry;

    if (!storage.save(progress)) {
      announce("Browser storage is unavailable. Download a backup to preserve your progress.", true);
    }
    if (result === "known") {
      knownThisSession++;
    } else {
      // Bring difficult terms back after up to two other cards in this session.
      queue.splice(Math.min(2, queue.length), 0, current);
    }
    advance();
  }

  const selector = byId("deck-select");
  for (const item of decks) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title;
    selector.appendChild(option);
  }

  selector.addEventListener("change", () => {
    const selected = decks.find((item) => item.id === selector.value);
    if (!selected) return;
    deck = selected;
    beginSession();
    announce("");
  });
  byId("reveal-btn").addEventListener("click", revealAnswer);
  byId("skip-btn").addEventListener("click", skipCard);
  byId("know-btn").addEventListener("click", () => grade("known"));
  byId("again-btn").addEventListener("click", () => grade("again"));
  byId("restart-btn").addEventListener("click", () => { beginSession(); announce("New round started."); });
  byId("download-btn").addEventListener("click", () => {
    try {
      storage.backup(progress);
      announce("Backup download requested. Keep the JSON file in a safe location.");
    } catch (_error) {
      announce("The download could not be started in this browser.", true);
    }
  });

  byId("import-input").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 256000) throw new Error("Backup is too large.");
      const parsed = JSON.parse(await file.text());
      const restored = storage.normalize(parsed, decks);
      if (!root.confirm("Replace your current progress with this backup?")) return;
      if (!storage.save(restored)) throw new Error("The browser could not save the restored progress.");
      progress = restored;
      beginSession();
      announce("Progress restored successfully.");
    } catch (error) {
      announce(`Backup could not be restored: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.target.closest("button,select,input,textarea,[contenteditable]")) return;
    if (event.code === "Space") {
      event.preventDefault();
      if (!current) return;
      if (answerVisible) skipCard(); else revealAnswer();
    } else if (event.key === "1") {
      grade("again");
    } else if (event.key === "2") {
      grade("known");
    }
  });

  beginSession();
  if (loaded.warning) announce(loaded.warning, true);
})(window);
