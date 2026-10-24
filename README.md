# StudyApp Flashcards

A deliberately small, bilingual flashcard application for learning academic terminology and practising **active recall**. The first deck covers key terminology from **COS512 Assignment 3 (Naïve Bayes Classification)**.

Inspired by the interaction pattern of [Chess-Mnemonic Flashcards](https://github.com/mmark76/Chess-Mnemonic-Application/tree/main/flashcards), but implemented independently with a simpler, modular design.

## Use

Open `index.html` in a modern browser. No installation, account, external library or server is required for the app's code and built-in deck. Browser storage availability can vary for `file://` pages; hosting the files on the same origin provides more predictable persistence.

1. Choose a deck and read the English term.
2. Recall its definition **before** clicking **Reveal answer**.
3. Compare your answer with the English definition, Greek explanation and assignment example.
4. Select **I know it** to finish that card for the current session or **Review again** to see it again soon. **Skip for now** postpones it without recording a result.

Keyboard: `Space` reveals/skips; after reveal, `1` means review again, and `2` means I know it. Keyboard shortcuts do not override focused form controls.

### Appearance

The Flashcards interface follows the parent [StudyApp Workspace](https://studyapp.markellosecosystem.com/#/workspace-beta) in both **Light** and **Dark** modes, using its neutral surfaces and warm accents. Use the header's `Dark` / `Light` button to switch. The preference stays in this browser separately from learning progress. The header also returns to StudyApp and the Markellos Ecosystem.

This is a focused visual alignment, not a complete migration to the shared dashboard shell. See [visual alignment decisions and verification](docs/visual-alignment.md).

## Data and privacy

- Built-in terminology lives in `src/decks.js`. Each card has a stable ID, English definition, Greek explanation, example and optional distinction.
- Study outcomes are stored **in the current browser** (`localStorage`); they are not sent to a server.
- **Download backup** creates a versioned JSON progress backup. **Restore backup** validates known deck/card IDs and asks before replacing stored progress.
- The JSON backup contains progress only. The academic definitions remain in the application source.
- For this MVP there is **no account, analytics, cloud sync or claim of long-term spaced-repetition scheduling**.
- Numerical examples illustrate the method. Confirm the actual token totals and vocabulary size against the assignment before using those figures in an exam answer.

## Structure

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic, accessible user interface |
| `src/styles.css` | Responsive presentation |
| `src/appearance.js` | Independent, validated Light/Dark appearance preference |
| `src/decks.js` | Independent, editable terminology decks |
| `src/storage.js` | Persistent progress and versioned backup validation |
| `src/app.js` | Card presentation and study-session workflow |
| `tests/flashcards.test.cjs` | Automated data and storage checks |
| `tests/appearance.test.cjs` | Appearance switch, storage failure, header links |
| `.github/workflows/ci.yml` | Checks on GitHub pull requests |

## Quality approach

We use **ISO/IEC/IEEE 12207:2026** (lifecycle), **ISO/IEC 25010:2023** (product quality), **ISO/IEC/IEEE 29148:2018** (requirements), **ISO/IEC/IEEE 29119** (testing), **OWASP ASVS 5.0.0** (applicable web security practices), and **W3C WCAG 2.2** (accessibility) as *reference frameworks*, proportionate to this small static application. This repository does not claim certification or complete standards compliance.

Initial acceptance criteria:

1. The page opens without fetching remote scripts, fonts or libraries.
2. A learner can reveal, skip, repeat or master each card using buttons or keyboard.
3. Cards marked for repetition appear again during the same session.
4. Each grade is preserved where browser storage is available; a progress backup can be exported and restored safely.
5. Terminology is displayed as text, with no interpretation of deck fields as HTML.
6. The design remains usable with keyboard controls and narrow screens.

## Tests

Requires Node.js for the automated checks only. The web app itself needs no Node.js.

```sh
node --check src/decks.js
node --check src/storage.js
node --check src/appearance.js
node --check src/app.js
node --test tests/*.test.cjs
```

## Versioning

Current preview version: **0.1.0**. The progress backup has a separate `schemaVersion: 1` for import compatibility. Future releases should follow Semantic Versioning and document any schema migrations before changing the format.
