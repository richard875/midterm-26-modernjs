# Midterm / 26

A small, frontend-focused **Modern.js 3** learning project: an interactive US map, House/Senate control markets, and nine Senate/governor races. Election day is **Tuesday, 3 November 2026**.

Built for an experienced React/Next.js developer. Start with the running app, then read [the 30-minute code tour](docs/modernjs-walkthrough.md). The original plan and implementation ledger are in [plan/](plan/00-project-plan.md).

## Run

Use Node **24** (or Node 22.18+ on the 22 line) and npm.

```sh
npm ci
npm run dev
```

Open **http://localhost:8080**. No API keys or environment variables are needed. The frontend and native Modern.js BFF run on the same port.

```sh
npm run check          # strict TypeScript + Biome + deterministic provider tests
npm run build          # Modern.js production build + Cloudflare static asset packaging
npm run serve          # Modern.js Node production server
npm run preview        # http://localhost:8788, the Cloudflare Worker + assets in workerd
```

The Cloudflare preview requires a successful `build` first. No Cloudflare login is needed for the local preview. It uses live external APIs; a provider outage is shown per source, without mock fallback.

## What is here

- File-based Modern.js routing (`src/routes`) and separate compile/runtime configs.
- React + strict TypeScript, Zod at external boundaries, a lazy-loaded SVG map, and a small cancellable fetch hook.
- Two native BFF endpoints: `GET /api/overview` and `GET /api/races`.
- Portable provider/services code shared with a small Cloudflare Worker.
- Nine curated races: Texas, Maine, Michigan, Kansas and Iowa Senate; Georgia, Wisconsin, Nevada and Ohio governor.
- Accessible map controls and state selector, race filters, refresh, individual poll history, source links, polling-age labels, and partial-error states.

## Data

Polling comes from **[VoteHub](https://votehub.com/polls/api/)** (House generic ballot) and **[Polling Forecast](https://www.pollingforecast.com/us/data)** (individual state polls). Both expose free public APIs with no keys. API availability and coverage can change.

Betting-market data comes directly from **[Polymarket](https://docs.polymarket.com/market-data/discover-markets)** and **[Kalshi](https://docs.kalshi.com/getting_started/quick_start_market_data)** only. Polymarket shows its Yes outcome prices; Kalshi shows current bid/ask midpoints. Independent party prices are not normalized. There is no trading functionality.

A poll's fieldwork date is different from the time we retrieve it. VoteHub's latest generic-ballot record was 4 October during verification; Wisconsin's latest matching poll was 9 October. The UI flags polls over 14 days old. A national Senate polling average would be misleading, so that panel shows the five watched state polls.

See [sources, licences and methodology](docs/data-sources.md) for exact endpoints and market mappings. Polls and market-implied probability answer different questions; neither is presented as an election result. Map colors indicate watchlist coverage, not projected winners.

## Cloudflare Workers

**There is one deployment adaptation:** Modern.js documents a Node server rather than a native Workers runtime. This repo deploys its CSR frontend as Workers static assets, with `worker/index.ts` providing the same small APIs at the edge. No Modern.js Node server is bundled into the Worker.

Build command: `npm run build`. Deploy command: `npx wrangler deploy`. Keep the repository root as the project root so Wrangler finds `wrangler.jsonc`. Full instructions: [Cloudflare deployment](docs/cloudflare.md).

This task initializes local Git and creates local commits. It does not create a remote repository or deploy anything.

## Small compatibility notes

Modern.js **3.10.3** has an ESM resolver issue with spaces in filesystem paths. This workspace has such a path. The guarded, idempotent [postinstall script](scripts/patch-modern-paths.mjs) repairs that URL-to-path conversion in the pinned dependency. It fails visibly if the upstream implementation changes; review/remove it when upgrading Modern.js. No global packages or global settings are modified.

After editing `modern.config.ts`, stop and restart the dev command manually. This release's automatic config restart hit an ESM module-resolution error in this environment; a fresh `npm run dev` starts successfully. Component/style HMR worked during verification.

The lockfile includes patched Undici and PostCSS selector parser overrides for the framework/development tool dependency tree. `npm audit` reported **zero vulnerabilities** after installation during verification. Modern.js's transitive `react-helmet` dependency still declares an older React peer range; npm reports a peer warning. This app does not use Helmet; its title/meta live in `modern.config.ts`.

There are no accounts, databases, analytics, monitoring, scheduled jobs or application rate limiters. Data refreshes on initial load and on demand. Google Fonts enhances typography; local sans-serif fallbacks work without it.
