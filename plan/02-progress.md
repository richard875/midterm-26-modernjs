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
