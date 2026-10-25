# Watchlist expansion — Kansas, Iowa and Ohio

Follow-up requested 25 October 2026. Read alongside the original implementation plan; this extends the watchlist without changing the data architecture or adding services.

## Ordered work

1. **Verify sources** — check exact 2026 general-election event/market identities on Polymarket and Kalshi, and matching rows in the two existing Polling Forecast bulk feeds.
2. **Update configuration and copy** — add Kansas Senate, Iowa Senate, Ohio Governor; derive the watchlist count and methodology office counts/state lists from `RACES`. Existing map, chamber summary, card and filter components should consume the same configuration.
3. **Verify and document** — add focused integration coverage for the three real response shapes and office separation; run typecheck/lint/tests and Pages build, smoke-test live data and inspect the three states/cards in the browser. Update the current source/coverage documentation and append verification results to the ledger. Historical checkpoints remain dated records.
4. **Commit the verified change** — preserve the established repository workflow and publish the update to the existing GitHub `main` branch. The earlier GitHub publication request supersedes the original local-only planning scope; no website deployment is requested.

## Verified mappings

| Race          | Poll key | Candidates (D / R)             | Polymarket event                | D / R market IDs | Kalshi event    |
| ------------- | -------- | ------------------------------ | ------------------------------- | ---------------- | --------------- |
| Kansas Senate | `KS`     | Adam Hamilton / Roger Marshall | `kansas-senate-election-winner` | 630746 / 630747  | `SENATEKS-26`   |
| Iowa Senate   | `IA`     | Josh Turek / Ashley Hinson     | `iowa-senate-election-winner`   | 630733 / 630734  | `SENATEIA-26`   |
| Ohio Governor | `G-OH`   | Amy Acton / Vivek Ramaswamy    | `ohio-governor-winner-2026`     | 629557 / 629558  | `GOVPARTYOH-26` |

Both party markets were open/active on each platform when checked. Latest matching poll fieldwork ended 14 October (Kansas), 22 October (Iowa), and 20 October (Ohio). Ohio also has separate Senate contests; matching must continue to require the `Governor` office and `G-OH` key, never `OH` or `OH-S`.

API verification used the existing provider endpoints directly. No percentages will be hardcoded into runtime code; observed response values are suitable for deterministic test fixtures only. Polls retain their real dates, original links and licences. Requests for nine races still use two bulk polling calls, plus one market request per exchange/race (20 upstream requests total for `/api/races`).

## Acceptance

- Nine total cards; five Senate and four governor races.
- KS and IA are highlighted in Senate map mode, OH in Governor mode; all three work in the state selector.
- The Senate chamber's state list includes Kansas and Iowa, and Ohio appears only in governor coverage.
- All three new race responses validate and show actual polling plus both market sources, or explicit per-source unavailability during outages.
- Existing polling/market semantics and the two-runtime backend remain unchanged.

## Verification result

- Completed the configuration and copy updates; the API returns nine races.
- `npm run check` passes (TypeScript, Biome and all nine tests). The new service integration fixture verifies the three independent provider identities, raw poll figures, two-sided market quotes, and exclusion of newer primary/wrong-office rows.
- `npm run build:pages` passes. The built application was tested in Wrangler/workerd, including a live `/api/races` response with successful polls, Polymarket and Kalshi feeds for each addition.
- Browser checks confirm all nine cards, five Senate filter results, four Governor filter results, and correct KS/IA/OH map behavior. Kansas was selected with Enter, Iowa and Ohio with the native selector. Ohio shows the Governor office and the Amy Acton/Vivek Ramaswamy matchup.
- Added the verified source mappings to `docs/data-sources.md`, updated README coverage, and retained an expansion screenshot. No new runtime adapter, dependency or infrastructure was needed.
