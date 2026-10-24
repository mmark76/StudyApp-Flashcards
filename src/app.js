/* Interface and study-session controller; scheduling and storage stay separate. */
(function startApplication(root) {
  "use strict";
  const decks = root.StudyFlashcardsDecks;
  const storage = root.StudyFlashcardsStorage;
  const scheduler = root.StudyFlashcardsSchedule;
  const byId = (id) => document.getElementById(id);

  if (!Array.isArray(decks) || !decks.length || !storage || !scheduler) {
    byId("card-term").textContent = "Flashcards are unavailable.";
    return;
  }

  const loaded = storage.load(decks);
  let progress = loaded.progress;
  let deck = decks[0];
  let mode = "quick";
  let queue = [];
  let current = null;
  let answerVisible = false;
  let knownThisSession = 0;
  let sessionTotal = 0;

  function announce(message, error = false) {
    const notice = byId("notice");
    notice.textContent = message;
    notice.classList.toggle("error", error);
  }

  function currentProgress() {
    return progress[deck.id] || Object.create(null);
  }

  function orderQuickCards() {
    const previous = currentProgress();
    const rank = (card) => previous[card.id]?.last === "again" ? 0 : previous[card.id]?.last === "known" ? 2 : 1;
    return [...deck.cards].sort((a, b) => rank(a) - rank(b));
  }

  function setMode(newMode) {
    if (newMode !== "quick" && newMode !== "deep") return;
    mode = newMode;
    byId("mode-quick").setAttribute("aria-pressed", String(mode === "quick"));
    byId("mode-deep").setAttribute("aria-pressed", String(mode === "deep"));
    byId("mode-description").textContent = mode === "quick"
      ? "Quick · Recall key terms and revisit difficult cards during this session."
      : "Deep · Study examples and distinctions; revisit cards when they become due.";
    byId("difficult-btn").hidden = mode !== "deep";
    beginSession();
    announce("");
  }

  function beginSession() {
    queue = mode === "deep"
      ? scheduler.dueCards(deck, progress)
      : orderQuickCards();
    sessionTotal = queue.length;
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
    const fraction = sessionTotal ? Math.round(knownThisSession / sessionTotal * 100) : 0;
    byId("deck-details").textContent = `${deck.cards.length} terms · ${deck.description}`;
    byId("session-count").textContent = `${knownThisSession} / ${sessionTotal} mastered`;
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
    byId("difficult-btn").hidden = mode !== "deep";
    byId("session-hint").textContent = mode === "deep"
      ? "Space: reveal or skip · 1: Again · 2: Known · 3: Difficult"
      : "Space: reveal or skip · 1: Review again · 2: I know it";

    if (complete) {
      const next = mode === "deep" ? scheduler.nextDueAt(deck, progress) : null;
      byId("done-title").textContent = sessionTotal ? "Session complete." :
        mode === "deep" ? "Nothing due for review." : "Session complete.";
      byId("done-description").textContent = sessionTotal
        ? "Your progress was saved. You can start another round whenever you like."
        : next ? `Your next Deep review is due ${new Date(next).toLocaleString()}.`
          : "You have no scheduled reviews. Switch to Quick or add a deck.";
      return;
    }
    byId("card-term").textContent = current.term;
    byId("answer-term").textContent = current.term;
    byId("answer-en").textContent = current.en;
    byId("answer-el").textContent = current.el;
    byId("answer-example").textContent = current.example;
    byId("answer-distinction").textContent = current.distinction || "";
    byId("example-block").hidden = mode !== "deep";
    byId("distinction-block").hidden = mode !== "deep" || !current.distinction;
  }

  function revealAnswer() {
    if (!current || answerVisible) return;
    answerVisible = true;
    render();
  }

  function skipCard() {
    if (!current) return;
    if (mode === "quick") queue.push(current);
    advance();
  }

  function grade(result) {
    if (!current || !answerVisible || !["known", "again", "difficult"].includes(result)) return;
    if (result === "difficult" && mode !== "deep") return;
    const currentDeck = currentProgress();
    const oldEntry = currentDeck[current.id] || {};
    let updatedEntry;
    if (mode === "quick") {
      updatedEntry = {
        ...oldEntry,
        last: result,
        known: (oldEntry.known || 0) + (result === "known" ? 1 : 0),
        again: (oldEntry.again || 0) + (result === "again" ? 1 : 0)
      };
    } else {
      const rating = result === "again" ? 0 : result === "difficult" ? 1 : 2;
      updatedEntry = { ...oldEntry, deep: scheduler.schedule(oldEntry.deep, rating) };
    }
    const updated = { ...progress, [deck.id]: { ...currentDeck, [current.id]: updatedEntry } };
    if (!storage.save(updated)) {
      announce("Progress could not be saved. Retry this card without losing your answer.", true);
      return;
    }
    progress = updated;
    if (result === "known") knownThisSession++;
    if (result === "again" && mode === "quick") {
      queue.splice(Math.min(2, queue.length), 0, current);
    }
    advance();
    announce("");
  }

  const selector = byId("deck-select");
  for (const item of decks) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title;
    selector.appendChild(option);
  }
  selector.addEventListener("change", () => {
    const selected = decks.find(item => item.id === selector.value);
    if (!selected) return;
    deck = selected;
    beginSession();
    announce("");
  });
  byId("mode-quick").addEventListener("click", () => setMode("quick"));
  byId("mode-deep").addEventListener("click", () => setMode("deep"));
  byId("reveal-btn").addEventListener("click", revealAnswer);
  byId("skip-btn").addEventListener("click", skipCard);
  byId("know-btn").addEventListener("click", () => grade("known"));
  byId("again-btn").addEventListener("click", () => grade("again"));
  byId("difficult-btn").addEventListener("click", () => grade("difficult"));
  byId("restart-btn").addEventListener("click", () => { beginSession(); announce("New round started."); });
  byId("download-btn").addEventListener("click", () => {
    try {
      storage.backup(progress);
      announce("Backup download requested. Keep the JSON file in a safe location.");
    } catch (_error) {
      announce("The download could not be started in this browser.", true);
    }
  });
  byId("restore-btn").addEventListener("click", () => byId("import-input").click());
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
    } else if (event.key === "3") {
      grade("difficult");
    }
  });
  setMode("quick");
  if (loaded.warning) announce(loaded.warning, true);
})(window);
