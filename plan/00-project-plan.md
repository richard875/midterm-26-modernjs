# Midterm / 26 — implementation plan

Written before implementation, 25 October 2026 (Australia/Sydney).

## Goal and scope

Build a small, polished, one-page 2026 US midterm dashboard as a Modern.js learning repository for an experienced React/Next.js engineer. Election day: Tuesday, 3 November 2026. Put an interactive US map first, two large House/Senate panels second, and a small selection of competitive Senate/Governor races below. The application is primarily client-rendered; small backend endpoints demonstrate Modern.js BFF conventions. No database, accounts, trading, monitoring, analytics, or rate limiter. Initialize local Git; do not push or publish.

## Decisions to verify during implementation

- Use the current Modern.js 3 release, React, strict TypeScript, runtime validation, and file-based routing.
- Modern.js currently documents a Node.js server, rather than a Cloudflare runtime. Build a static frontend for Pages and provide thin Pages Functions wrappers around portable backend services. Keep real Modern.js `api/lambda` handlers for local development and a Node deployment. Do not imply the Modern.js Node server runs on Pages.
- Use free public polling APIs, initially investigating VoteHub (generic ballot) and Polling Forecast (race polls). Confirm real response shapes, coverage, attribution, and availability. Never replace missing live data with invented polls or odds.
- Read betting-market prices directly from Polymarket Gamma and Kalshi public APIs only. Match explicit 2026 election events and candidates/parties; document the mapping. Return unavailable per source when a matching market cannot be verified.
- Keep polling vote share separate from market-implied win probability. Do not imply a national Senate polling average or convert a generic ballot into seat-control probability.
- Curate a few races with coverage, rather than a nationwide forecasting system. Map shading must have a clear meaning and no invented ratings.

## Ordered phases and exit criteria

1. **Research and contracts** — record authoritative sources, deployment tradeoff, data schemas, source attribution, selected races, and a learning-oriented file tree. Exit: `01-architecture-and-data.md` exists and live responses have been inspected.
2. **Scaffold** — initialize Git, package manifest and lockfile, Modern.js config, strict TypeScript, route entry, basic shell, formatting/lint scripts. Exit: app builds and typechecks with aligned Modern.js versions.
3. **Backend and data** — implement validated polling/market adapters and portable aggregation; add thin Modern.js BFF endpoints. Include timeouts, partial errors, timestamps, bounded requests, race allowlists, and tests of data semantics. Exit: real endpoints work or return useful per-source unavailability; deterministic tests cover bad payloads and matching.
4. **Frontend** — implement responsive editorial dashboard, lazy-loaded interactive US map, chamber cards, race cards, source/methodology explanations, refresh, accessible controls, loading/empty/error states. Exit: every control has real behavior; no fabricated live data.
5. **Cloudflare Pages** — implement thin Pages Functions, static build packaging, Wrangler configuration and local preview scripts. Exit: built assets and API routes run together using the Cloudflare runtime, without Node-only server imports.
6. **Verify and teach** — typecheck, lint, focused tests, production build, browser checks at desktop/mobile and API smoke checks. Write README, a concise Modern.js walkthrough with Next.js comparisons, deployment steps, and a completed progress ledger. Exit: clean checks, reviewable local commits, honest limitations, local preview ready.

Read this plan at the start of every phase. Update progress and decisions after each phase; revise the plan only with an explicit rationale in the ledger. Commit meaningful milestones so the sequence is inspectable.

## Visual direction

An understated election desk: warm off-white canvas, dark ink, restrained blue and red, fine rules, clear typography and generous space. A geographic SVG map with accessible state selection; highlight tracked states and use selected-state details. Cards emphasize source-specific market prices and dated polling. Responsive two-column chamber row, three-column race grid where space permits.

## Verification strategy

Use deterministic fixture tests for adapter parsing, party/candidate mapping, stale data and partial upstream failures; fixtures are test-only. Test the shared service contract and both runtime wrappers. Run the built Pages bundle locally and inspect map selection, filters, refresh, source details, keyboard behavior, mobile overflow, loading and errors. Document live upstream outages separately from application failures. Avoid tests that only duplicate UI implementation.
