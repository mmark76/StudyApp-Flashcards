# StudyApp Flashcards — focused visual alignment

## Decision and scope

The approved user goal is visual and interaction continuity with the **existing StudyApp Workspace BETA**, while retaining Flashcards as a small standalone learning tool. The parent StudyApp and ecosystem framework repositories are read-only references in this change.

- **Shared identity:** same Study App name, restrained header, warm-neutral surfaces, typography, spacing and button hierarchy.
- **Navigation:** direct return to the StudyApp Workspace and the ecosystem homepage.
- **Appearance:** Light/Dark action in the header; independent, validated appearance preference stored under `studyapp-flashcards-appearance`. A browser that blocks storage still permits in-session changes.
- **Learning experience:** card content, decks, scoring, keyboard commands, restore and backup remain unchanged.
- **Excluded:** full dashboard-shell migration, an Assistant, Settings/Info dialogs, and full UI localization. These require separate scope, decisions and verification.

## Source mapping

| Source | Applied interpretation |
| --- | --- |
| `mmark76/StudyApp` · `src/styles/workspaceBeta.css` | Quiet neutral shell, compact header and understated borders |
| `mmark76/StudyApp` · `src/styles/workspaceBetaTheme.css` | Dark mode background `#171716`, surface `#20201f`, warm highlight family |
| `mmark76/StudyApp` · `src/styles/workspaceBetaHeaderControls.css` | Header return path and simple appearance action |
| `mmark76/StudyApp` · `src/styles/workspaceBetaLightPolish.css` | Warm/light secondary actions and Flashcards' purple practice action |
| `mmark76/ecosystem-framework` · `UI_UX_RULES.md` | Semantic styles, shared behavior, accessible focus, compact navigation |
| `mmark76/ecosystem-framework` · `docs/design/UI_UX_DESIGN_SYSTEM.md` v1.2.0 | Sans-serif font stack, 4px spacing scale, subdued elevation, responsive widths |
| `mmark76/ecosystem-framework` · `PROJECT_DASHBOARD_GUIDE.md` | Header/Main/Footer identity guidance, with full dashboard migration out of scope |

### Existing palette variance

The framework's currently published theme tokens use blue-based brand foundations and five approved app themes. The already published StudyApp Workspace uses a **warm neutral/amber palette**. This Flashcards iteration mirrors the actual StudyApp as explicitly requested, rather than quietly inventing a new ecosystem-wide theme. A future framework change-control decision can register a shared StudyApp palette or approve a named exception. No framework tokens or files are changed here.

The approved production Markellos monogram SVG is not yet present in the framework's `design-system/brand` directory; no substitute logo has been invented for this work.

## Verification

- Automated Node tests cover both learning data and appearance-state behavior.
- Measured WCAG text contrast ratios for representative pairs (minimum target 4.5:1):
  - light primary text on white **16.51:1**; light muted text **6.83:1**;
  - light amber highlight **7.16:1**; light primary button text **6.97:1**;
  - dark primary text on dark surface **14.54:1**; dark muted **9.41:1**;
  - dark amber highlight **6.63:1**; dark primary button text **8.51:1**.
- Controls and links use a minimum target of 44 CSS px; reduced-motion preferences disable nonessential transitions.
- Mobile, tablet and desktop CSS breakpoints are defined at 600px and 800px.

### Pending before release

Visual browser checks at mobile/tablet/desktop, keyboard and assistive-technology interaction checks, 200% zoom, and verified release build metadata should be performed before merging or deploying. Automated test success does not replace these checks. The full dashboard's GR/EN controls and Settings/Info suite are **not** claimed as implemented.
