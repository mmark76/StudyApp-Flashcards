# Quick & Deep study modes — v0.2.0 preview

The standalone Flashcards application offers **two study modes sharing one deck and the same local progress store**.

- **Quick:** original active recall workflow, with immediate in-session reappearance of cards marked Again. Keeps existing known/again counts and prioritizes previously difficult terms. Shows English definition and Greek explanation after reveal.
- **Deep:** three ratings (Again / Difficult / Known) and schedule-based review. New cards are eligible immediately; previously studied cards are eligible when due. Rating Again schedules 10 minutes; Difficult starts at one day and grows x1.8; Known starts at three days and grows x2.5, capped at 180 days. This intentionally mirrors the existing StudyApp simple scheduling policy, not SM-2 or FSRS. Example and distinction appear in this mode.
- **Backups:** JSON schema version stays 1 and existing Quick records remain readable. Optional `deep` scheduling metadata is stored alongside per-card Quick progress. The backup exports both; importing validates new metadata before replacing stored progress. There is no automatic cross-domain sync with StudyApp.
- **Persistence:** localStorage remains in this preview. It has *not* yet been replaced with the StudyApp IndexedDB transaction architecture. No account, backend or analytics is introduced.
- **Version:** user-facing preview label and progress backup naming are v0.2.0; the data schema is independently versioned.

## Next architectural phase

A shared versioned learning core between StudyApp and standalone Flashcards, backed by an IndexedDB migration with explicit legacy-progress transfer, remains future work. Avoid calling this preview a completed codebase unification. Test the migration with real browser data and backups before changing persistence.

## Manual acceptance checks

1. Quick still repeats Again within the session and restores legacy progress backups.
2. Deep displays examples/distinctions, offers three ratings and excludes not-yet-due cards.
3. Switching modes does not delete or conflate Quick and Deep records.
4. Export and restore progress after Deep ratings, refresh the browser and verify schedules survive.
5. Test keyboard navigation, light/dark modes, narrow screens and offline behavior.
