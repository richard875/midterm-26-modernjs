# Verification record

25 October 2026, Australia/Sydney. These are local verification results, not a deployed-site claim.

## Automated and runtime checks

- `npm run typecheck`: strict TypeScript checks across browser, shared contracts, backend, BFF, Pages Functions and tests.
- `npm run lint`: Biome formatting, import organization and recommended lint/accessibility rules. Generated build and Wrangler files follow `.gitignore`.
- `npm test`: 8 deterministic adapter/service tests. Covers exact market IDs, reversed Yes/No outcome order, independent prices, bid/ask midpoint semantics, empty/crossed books, malformed/null prices, primaries/hypothetical matchups, future/invalid/duplicate poll rows, both VoteHub envelopes, and independent/complete provider failures.
- `npm run build:pages`: Modern.js browser build, Node BFF build and allowlisted static packaging.
- `npm audit`: zero reported vulnerabilities with the committed dependency overrides/lockfile at this checkpoint.

Real HTTP smoke checks succeeded for both endpoints under **Modern.js dev** and under **Wrangler/workerd**. All eight events returned data from both Polymarket and Kalshi; all six state polling feeds and the generic ballot returned valid data. Unknown `/api/does-not-exist` returned JSON 404 in Pages; successful Pages APIs returned JSON with `Cache-Control: no-store`.

Source availability is an observation at verification time. It is not enforced by the deterministic test suite, and later upstream outages should remain visible in the UI.

## Browser checks

Tested the built Pages frontend in the Codex in-app browser. Inspected the map, chamber row, polling-age labels, candidate figures and independent market prices. Selected a governor filter and Georgia, and confirmed the selected state panel updated to the governor race.

Mobile layout was inspected in a temporary same-origin **390px-wide iframe viewport** served only from the ignored build output. This exercises CSS layout/media queries, not mobile hardware or a touch-device emulator. The map, state selector and cards fit the frame; a race-card screenshot is retained below. The temporary harness is removed before delivery.

Tested a governor-only watchlist filter, then followed the Senate panel's Texas link: the filter reset, the Texas card reappeared and the page scrolled to it. Expanded recent polling sources and checked that figures, population, sample sizes, pollster links and licences were present.

The native state selector was used to choose California and showed the out-of-watchlist message. Pressing Enter on Michigan selected it and updated the detail panel. Refresh showed a disabled pending state while keeping the prior snapshot visible. The final HTML has `lang=en` and a viewport that allows zoom.

The map is implemented with keyboard handlers (Enter/Space), named pressed-state controls, and an alternative native state selector. Reduced motion is respected. This is not a full assistive-technology audit or a cross-browser/device certification.

## Artifacts

- [Desktop screenshot](screenshots/desktop.png)
- [Mobile card screenshot](screenshots/mobile.png)

Fresh native development startup was checked again after the final HTML template change: HTML 200 and valid live overview data. The framework's automatic restart after a compile-config edit failed on ESM module resolution; manual restart works and is documented in the README.

No cloud deployment, remote repository, account login or external publication was performed.

## Watchlist expansion — 25 October 2026

Added Kansas Senate, Iowa Senate and Ohio Governor, for nine races (five Senate and four governor). The initial results above remain a record of the original six-race version.

- `npm run check` passes with nine tests across two files. The additional integration test checks captured public response shapes for the three new mappings and excludes primary/Ohio Senate rows from governor coverage.
- `npm run build:pages` passes. A live `/api/races` request through Wrangler/workerd returned all nine entries; polls and both market sources were successful for each addition.
- Browser checks confirm the `09` badge, the five-card Senate filter and four-card Governor filter. KS and IA are highlighted in Senate map mode; OH is highlighted in Governor mode. Enter-key Kansas selection and the native state selector for Iowa/Ohio update the correct poll and market details.
- Current counts and methodology state lists derive from the race configuration.

[Expanded watchlist screenshot](screenshots/watchlist-expansion.png) shows the three additions with live data.
