# Progress ledger

## Planning checkpoint — 25 October 2026

- Inspected the workspace: only an empty `plan/` folder and macOS metadata; no existing source or Git repository.
- Read current Modern.js quick start, BFF and deployment documentation, and Cloudflare Pages Functions documentation.
- Verified npm publishes aligned `@modern-js/app-tools`, `@modern-js/runtime`, and `@modern-js/plugin-bff` at 3.10.3.
- Wrote `00-project-plan.md` before adding implementation files.
- Research in progress: verify polling responses and exact prediction-market event identifiers before implementation.

## Phase 1 — complete

- Added `01-architecture-and-data.md` with verified API shapes, licence requirements, and the Node/Pages deployment decision.
- Verified all eight 2026 events directly with both exchanges. Selected TX/ME/MI Senate and GA/WI/NV Governor after checking coverage. Governor polling uses `G-XX` keys; primaries and alternate matchups must be excluded.
- Scope clarification: use a curated watchlist, not a forecast/rating map. Chamber Senate polling summarizes watched races rather than inventing a nationwide Senate poll.

## Phase 2 — in progress

- Added aligned Modern.js 3.10.3 packages, React 19, strict TypeScript, Biome, Vitest, and Wrangler scripts.
- Added the file-based route shell and native BFF plugin. npm installation is running.

## Phases 2 and 3 — complete

- Framework build and strict typecheck pass; native `/api/overview` and `/api/races` work.
- Implemented explicit 2026 event identities, validated schemas, safe HTTP URLs, two-sided Kalshi quote handling, and partial provider errors.
- Eight focused tests pass for exact market matching, reversed outcome ordering, malformed/null prices, primaries, hypothetical matchups, future/duplicate polls and provider outages.
- Live smoke check: House/Senate markets and all six race markets/poll feeds returned successfully through Modern.js.
- Environment fix: npm's initial optional-native-package installation needed a second `npm install --include=optional`. Added approved native build-script declarations to the manifest.
- Framework defect: Modern.js 3.10.3 ESM resolver retains URL-escaped `%20` in paths. Added a guarded, idempotent postinstall patch for this pinned version; the repository path contains spaces. CommonJS resolver is unaffected. Document the workaround and remove after a verified upstream fix.
- Dependency hygiene: override Undici to its patched 7.30.1 line for Wrangler's local runtime; no high-severity audit findings remain at this checkpoint.

## Phase 4 — complete, verification ongoing

- Responsive map + state selector, map office filter, chamber cards, six race cards, independent race filter, real refresh, source links, recent-poll details and methodology.
- All 50 states plus DC are selectable; out-of-scope states explain watchlist coverage.
- SVG map paths are in a separate lazy chunk; map controls import only small state metadata. Geometry is generated locally from pinned us-atlas rather than loaded at runtime from a CDN.
- Browser inspection confirms real data, no horizontal overflow at 942px, and visible polling-age flags.

## Phase 5 — implementation complete

- `build:pages` packages Modern.js CSR HTML + static assets into `dist/pages`; Node output is excluded.
- Added Pages Functions for the same two contracts, JSON 404 for unknown APIs, Wrangler config, API-only function routing and immutable hashed assets.
- Production build and Pages asset packaging pass. Workerd preview and browser checks are next.

## Phase 6 — complete

- Final `npm run check` passes: strict TypeScript, Biome formatting/lint and all 8 tests.
- Final `npm run build:pages` passes, including the custom build-time `src/Document.tsx` template. Verified `lang=en` and a single zoom-friendly viewport tag in the generated HTML.
- Verified the built frontend and real APIs in workerd. All 6 race feeds and all 16 exchange-event quote pairs (8 events × 2 sources) returned valid data. Unknown API route returned JSON 404; successful APIs use no-store.
- Desktop/tablet browser inspection plus a 390px iframe layout check. Exercised map office/state selection, out-of-watchlist messaging, race filtering, hidden-card navigation, recent poll/source disclosure, and the state selector. Enter-key map selection works; refresh shows a disabled pending state and retains the previous snapshot until the responses arrive.
- Fixed cross-filter links so selecting a race reveals its card and returning to the map clears a conflicting office filter. Failed initial loads now use an unavailable state instead of an endless loading label.
- Added README, a 30-minute Modern.js tour, source/licensing methodology, Cloudflare instructions and verification notes/screenshots. No cloud account or remote Git operations were performed.
- Added guarded dependency overrides for Undici and PostCSS selector parser; `npm audit` reports zero vulnerabilities. The retained transitive React Helmet peer warning is documented.
- Temporary mobile QA harness exists only in ignored build output and is removed by final packaging. Preview servers are stopped at handoff; use `npm run dev` or the Pages preview commands to restart.

All six planned implementation phases are complete. The only material compatibility addition is the documented Modern.js 3.10.3 ESM path workaround required by this folder's spaces. Local-only development and verification remain the authorized scope; deployment is documented for the user's later use.

Final handoff check: a fresh `npm run dev` serves HTML 200 and the native API successfully. During configuration editing, Modern.js's automatic restart hit an upstream ESM `./plugins/analyze` resolution error; the README explicitly instructs manual restart after compile-config edits. Ordinary component/style HMR and fresh startup work. This is a documented framework limitation, not a reason to add another vendor patch.
