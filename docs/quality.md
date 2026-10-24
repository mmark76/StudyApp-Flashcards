# Quality and Standards Reference — v0.1.0

This note maps internationally recognized **reference frameworks** to project-level decisions. It does **not** assert that the project is certified or fully compliant with any standard.

| Reference | Practical application in this release | Evidence / status |
| --- | --- | --- |
| ISO/IEC/IEEE 12207:2026 | Bounded scope, source control, reviewable changes and lifecycle documentation | README, isolated feature PR (pending) |
| ISO/IEC/IEEE 29148:2018 | Explicit functional and non-functional acceptance criteria | README and requirements below |
| ISO/IEC 25010:2023 | Functional suitability, reliability, usability, maintainability and security | Modular files, saved data, clear card actions; browser QA pending |
| ISO/IEC/IEEE 29119 series | Automated testable conditions and regression testing | Node tests and GitHub Actions; browser QA pending |
| OWASP ASVS 5.0.0 | Avoid unsafe HTML insertion; validate imported data; minimize attack surface | `textContent`, strict backup import, no external scripts, authentication or backend |
| WCAG 2.2 | Semantic HTML, keyboard access, visible focus and adaptable layouts | HTML/CSS implementation; assistive-technology verification pending |

## Functional requirements (MVP)

- **FR-01** — The learner can choose an available deck.
- **FR-02** — A card first shows its English term; its definition is revealed only on request.
- **FR-03** — The answer shows an English definition, Greek explanation, example and distinction.
- **FR-04** — "I know it" completes the card in the current session. "Review again" brings it back within the same session.
- **FR-05** — A learner may skip without being marked correct.
- **FR-06** — The app saves results in the browser and exports/imports a validated, versioned JSON backup.

## Non-functional requirements (MVP)

- **NFR-01** — No build tool, runtime server or external package is needed to display the built-in deck.
- **NFR-02** — No analytics or automatic transmission of study results.
- **NFR-03** — Keyboard access, labelled controls, visible focus and responsive layout.
- **NFR-04** — Independently maintained UI, dataset, persistence and session workflow components.
- **NFR-05** — CI must check JavaScript syntax and exercise automated regression tests.

## Verification boundaries

Automated Node tests cover card structure, storage validation and basic session transitions. This is **not** a substitute for testing with actual browsers, screen readers and device sizes. No claim of full WCAG or OWASP ASVS conformance should be made without a documented verification against the applicable individual criteria.

## Source references

- [ISO/IEC/IEEE 12207:2026](https://www.iso.org/standard/90219.html)
- [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html)
- [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html)
- [ISO/IEC/IEEE 29119-1:2022](https://www.iso.org/standard/81291.html)
- [OWASP ASVS 5.0.0](https://asvs.owasp.org/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
