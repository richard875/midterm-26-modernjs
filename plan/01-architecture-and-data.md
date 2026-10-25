# Architecture and verified sources

## Framework and runtime

Use Modern.js 3.10.3 (`app-tools`, `runtime`, `plugin-bff`, `tsconfig` aligned), React 19, TypeScript, Zod, Biome, and Vitest. Use npm with a committed lockfile. This is a CSR page with Modern.js file-based routing; the map loads via `React.lazy`. Source services use Web APIs only so both the Node BFF runtime and Pages Functions can call them.

- `src/routes/{layout,page}.tsx`: Modern.js route conventions and page composition.
- `src/features/{map,chambers,races}`: small UI features.
- `src/components`: shared presentation, source/status UI.
- `src/hooks`: client fetch lifecycle, cancellation, refresh and validation.
- `shared`: Zod response contracts and curated race metadata. No backend imports.
- `server/{providers,services}`: upstream adapters and aggregation, never imported by UI.
- `api/lambda/{overview,races}.ts`: thin native Modern.js BFF routes.
- `functions/api/{overview,races}.ts`: thin Pages Functions routes using those services.
- `scripts`: static asset packaging and map preparation.
- `tests`: deterministic provider/service tests; no fixture fallback in production.
- `docs`: learning walkthrough, deployment and source methodology.

## Cloudflare correction

Modern.js officially documents Node.js deployment; it does not supply an official Pages adapter. Build its CSR output, copy only HTML/static assets into `dist/pages`, and let Cloudflare compile `functions/`. Keep identical GET JSON contracts at `/api/overview` and `/api/races`. Explicit client fetch makes this runtime boundary easy to see; the learning guide also shows Modern.js unified BFF invocation. Do not deploy the generated Modern.js Node server bundle to Pages. No account access or deployment is required for this task.

Sources: [Modern.js quick start](https://modernjs.dev/guides/get-started/quick-start), [BFF](https://modernjs.dev/guides/advanced-features/bff/function), [deployment](https://modernjs.dev/guides/basic-features/deploy), [Pages Functions](https://developers.cloudflare.com/pages/functions/).

## Polls

1. **VoteHub**, `https://api.votehub.com/polls?poll_type=generic-ballot&subject=2026`. No key. Verified response is a bare array (documentation also illustrates an envelope). Fields include dates, pollster, sample, population, `answers: [{choice,pct}]`, original URL, partisan/internal flags. At research time the latest fieldwork end was 4 October 2026. Show its actual date and age; do not label retrieval time as poll freshness. CC BY 4.0 attribution.
2. **Polling Forecast**, `https://www.pollingforecast.com/api/us/polls?kind=Senate` and `?kind=Governor`. No key. Verified envelope: `dataset`, `asOf`, `licence`, `attribution`, `rows`. Race keys are `TX`, `ME`, `MI` for Senate and `G-GA`, `G-WI`, `G-NV` for governor. Rows have `stage`, `question`, fieldwork dates, sample, population, pollster, `figures` as semicolon-separated candidate/party/value strings, `source_url`, `licence`. Accept only general-election `stage=vote`, main questions, valid date/value pairs and the curated D/R matchup. Display actual figures, not the provider's adjusted margins or forecast. Keep each row's source and licence. Rows sourced from Wikipedia are CC BY-SA 4.0; normalized rows retain this attribution and share-alike notice.

Present the latest valid poll plus recent individual polls. Do not build a forecast or call an unweighted average a polling model. National Senate control has no directly comparable national vote-share poll; show the three watched Senate races there instead.

Docs: [VoteHub API](https://votehub.com/polls/api/), [Polling Forecast API/data](https://www.pollingforecast.com/us/data).

## Markets

Only call Polymarket Gamma and Kalshi public market-data APIs. No keys, trading SDK, wallets, orders, or other odds vendors.

- Polymarket: `https://gamma-api.polymarket.com/events?slug=...`. Exact curated event slug and market IDs. Parse JSON-encoded outcomes and prices; locate `Yes` by name rather than array position. Require open/active market. Display the supplied outcome price, with its upstream update timestamp.
- Kalshi: `https://api.elections.kalshi.com/trade-api/v2/markets?event_ticker=...&limit=100`. Exact event ticker and D/R ticker suffix. Use `(yes_bid_dollars + yes_ask_dollars) / 2` with a valid two-sided quote, not last trade or metadata `updated_time`. Retrieval time describes quote observation; the market metadata timestamp is not a trade timestamp. Prices are independent and may sum above/below 100%; do not normalize or infer the other party with `100 - price`.

Chambers: Polymarket `which-party-will-win-the-house-in-2026` (562802/562803), `which-party-will-win-the-senate-in-2026` (562793/562794); Kalshi `CONTROLH-2026`, `CONTROLS-2026`.

Watchlist (curated learning scope, not a model ranking): TX Senate, ME Senate, MI Senate; GA Governor, WI Governor, NV Governor. Verify all exact event and market IDs before populating the config. If an event is missing, return source-specific unavailability.

Docs: [Polymarket market discovery](https://docs.polymarket.com/market-data/discover-markets), [Kalshi public data](https://docs.kalshi.com/getting_started/quick_start_market_data). Kalshi documents an external-api host as well; the elections host was tested successfully.

## Boundary behavior

- Validate upstream payloads and frontend responses with Zod; reject malformed percentages, unsafe URLs and invalid dates.
- Fixed provider URLs and curated IDs, bounded result counts, per-request timeout; no arbitrary proxy endpoint.
- Independent provider failures yield partial data and readable per-source status. Never ship test fixtures as live fallback.
- Client requests abort on unmount and sequence refreshes; preserve successful data if refresh fails, labeling its original retrieval time.
- Every number links to its source; polling and market probability use separate labels and scales.
