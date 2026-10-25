# Data sources and interpretation

All polling is obtained from public, free JSON APIs. All betting-market data is read directly from Polymarket and Kalshi. There are no keys, simulated runtime data, manually hardcoded poll percentages or third-party odds aggregators.

## Polling feeds

| Provider         | Endpoint                                                              | Used for                                                      |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| VoteHub          | `https://api.votehub.com/polls?poll_type=generic-ballot&subject=2026` | Latest House generic ballot and up to eight distinct releases |
| Polling Forecast | `https://www.pollingforecast.com/api/us/polls?kind=Senate`            | TX, ME, MI general-election candidate polls                   |
| Polling Forecast | `https://www.pollingforecast.com/api/us/polls?kind=Governor`          | `G-GA`, `G-WI`, `G-NV` candidate polls                        |

These endpoints were tested through both the Modern.js BFF and Cloudflare's local workerd runtime on 25 October 2026. Free access is the provider's current policy, not a guarantee of future uptime or coverage. [VoteHub docs](https://votehub.com/polls/api/), [Polling Forecast docs](https://www.pollingforecast.com/us/data).

State filters require `stage=vote`, `question=Main`, the correct office/state and the two configured candidate names. Primaries, runoffs and hypothetical pairings are excluded. Percentages, safe source URLs and calendar dates are validated; future/invalid dates and impossible D/R totals are excluded. Repeated pollster/end-date releases are reduced to one, then sorted by fieldwork end and ID. Up to eight polls survive per race. This is a release selection rule, not a model, and can omit sample variants.

The displayed headline is the **latest matching individual poll**. There is no poll weighting, smoothing, estimate of margin of error, adjustment or win-probability conversion. We parse raw candidate figures and ignore the provider's adjusted margins and forecast outputs. Bars show vote shares on a 0–100 scale; the remaining space includes undecided/other responses. Rounding can produce totals around 100%.

The generic ballot asks about party preference for Congress; it is not a House seat forecast. The Senate panel lists the watched state polls because a national Senate ballot does not exist. LV means likely voters; RV means registered voters; A means adults. Partisan/internal flags are preserved when supplied.

Fieldwork dates are shown independently of retrieval time. A 14-day age label indicates an older survey; it does not delete history or imply a statistical cutoff. The initial checks found VoteHub's latest record ending 4 October and Wisconsin's latest matching survey ending 9 October.

## Market identities

Polymarket: `https://gamma-api.polymarket.com/events?slug={slug}`.
Kalshi: `https://api.elections.kalshi.com/trade-api/v2/markets?event_ticker={event}&limit=100`.

| Race           | Polymarket slug                           | D / R market IDs | Kalshi event    |
| -------------- | ----------------------------------------- | ---------------- | --------------- |
| House control  | `which-party-will-win-the-house-in-2026`  | 562802 / 562803  | `CONTROLH-2026` |
| Senate control | `which-party-will-win-the-senate-in-2026` | 562793 / 562794  | `CONTROLS-2026` |
| TX Senate      | `texas-senate-election-winner`            | 630963 / 630964  | `SENATETX-26`   |
| ME Senate      | `maine-senate-election-winner`            | 630772 / 630773  | `SENATEME-26`   |
| MI Senate      | `michigan-senate-election-winner`         | 630805 / 630806  | `SENATEMI-26`   |
| GA Governor    | `georgia-governor-winner-2026`            | 629337 / 629338  | `GOVPARTYGA-26` |
| WI Governor    | `wisconsin-governor-winner-2026`          | 629720 / 629721  | `GOVPARTYWI-26` |
| NV Governor    | `nevada-governor-winner-2026`             | 629505 / 629506  | `GOVPARTYNV-26` |

Kalshi party market tickers append `-D` / `-R`. Every identity was checked directly; no runtime fuzzy discovery is performed. The candidacies in `shared/races.ts` were verified from those markets and matching poll rows. Review this configuration when the cycle changes.

Polymarket's JSON-encoded `outcomes` and `outcomePrices` are paired by index, with `Yes` located by name. We use its supplied outcome price for each explicit party market and require active, open contracts. The pair's update timestamp is the older of the two outcome update timestamps.

Kalshi uses the midpoint of `yes_bid_dollars` and `yes_ask_dollars`, requiring an active market and a nonempty, uncrossed two-sided book. It does not fall back to last trade or legacy integer-cent fields. Kalshi metadata `updated_time` is not a quote/trade timestamp, so it is deliberately not used as price freshness.

Each platform defines its own settlement rules, including control/tie/runoff handling. Links open the exact platform event so readers can inspect those rules. Independently priced party outcomes may sum above or below 100%; we do not normalize or derive a party's price as the complement of the other. Different platforms' prices are not averaged. Fees, liquidity and bid/ask spreads are not incorporated into a forecast.

[Polymarket public market data](https://docs.polymarket.com/market-data/discover-markets), [Kalshi public market data](https://docs.kalshi.com/getting_started/quick_start_market_data).

## Failures and refresh

The page requests two same-origin endpoints once at load and when Refresh data is selected. Each provider request has an eight-second timeout. Feed-level failures return a partial dashboard and retain readable source status. Transport/schema failures at the browser preserve the previous successful section and its original retrieval timestamp, with an error banner. Nothing is silently substituted.

Market observation time means when the quote response was received, not a guarantee that a trade occurred at that instant. Polling age is based on the actual fieldwork end date. No forecast is derived from map shading: green means a race is on the selected watchlist, peach means the selected state, gray means out of scope.

## Attribution and licences

- **VoteHub** polling API: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Original pollster names and source links remain attached to every normalized row.
- **Polling Forecast**: API attribution is retained in this documentation and the page. Wikipedia-sourced poll rows carry [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The normalized state-poll rows in `/api/races` are offered under the same CC BY-SA 4.0 terms; modifications consist of field renaming, candidate selection, numeric parsing, validation, sorting and deduplication. Each row retains its provider licence string and original source link. No licence for the repository's application code is implied by this data notice.
- **US map**: geometry is generated from [us-atlas 3.0.1](https://github.com/topojson/us-atlas), using US Census cartographic boundaries and its Albers USA projection. The us-atlas package is ISC-licensed; Census geometry is public domain. Alaska/Hawaii are inset and DC is selectable alongside the 50 states.
- **Polymarket / Kalshi**: attribution and source links identify the origin of displayed prices. No affiliation, endorsement, redistribution licence for platform content, or ownership of their market data is claimed.
