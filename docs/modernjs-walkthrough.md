# A 30-minute Modern.js tour for a React/Next.js engineer

Use `npm run dev`, keep the browser Network panel open, and follow a request from the route to the provider. This repo intentionally has one route and two read APIs, so the framework boundary stays visible.

## 1. Configuration and route entry — 5 minutes

Open `modern.config.ts`. `appTools()` integrates Modern.js's CLI, Rsbuild/Rspack build and Node server; `bffPlugin()` adds the backend convention. The official Modern.js packages are pinned to the same release. `server.ssr: false` is deliberate: this dashboard ships a CSR document that Cloudflare Pages can host. The generated HTML contains the app shell, not fetched election data.

Open `src/modern.runtime.ts`. Runtime configuration is distinct from compile configuration in Modern.js 3. There are no custom runtime plugins here because the page does not need them.

Read `src/Document.tsx`: Modern.js renders this HTML template at build time. It sets the document language and no-JavaScript message; metadata and scripts are supplied by the framework. The viewport allows zoom.

Read `src/routes/layout.tsx` and `page.tsx`. The layout renders the router's `Outlet`, imports the global theme, and lets `page.tsx` compose the dashboard. These conventions should feel familiar from Next's app directory, but this project is a normal client React tree. It does not enable React Server Components or Next-style server actions.

Experiment: change `html.title` in the compile config and restart. Change a component and watch HMR. This demonstrates which work the CLI owns versus which work React owns.

## 2. Follow a backend request — 7 minutes

Open `api/lambda/overview.ts`. Its named `get` export becomes `GET /api/overview`; `api/lambda/races.ts` becomes `GET /api/races`. There is no hand-built Express router.

Both handlers delegate to `server/services/elections.ts`. The service coordinates requests; adapters in `server/providers` know each upstream wire format. This avoids putting business logic in framework handlers, and makes the edge adaptation small.

Modern.js also offers **unified invocation**. Its compiler can turn an imported BFF function into an HTTP request:

```tsx
import { get as getOverview } from '@api/overview';

// Inside your normal asynchronous client data lifecycle:
const result = await getOverview();
```

The `@api/*` TypeScript alias is configured already. Try replacing the fetch call for one endpoint with this import on a branch. Watch the browser request `/api/overview`; inspect the built client to confirm server code is excluded. Type inference comes from the exported function, while runtime validation still belongs at the external boundary.

The shipped app uses explicit `fetch('/api/overview')` instead. That keeps the identical HTTP contract obvious across Modern.js BFF and Pages Functions, and lets the hook abort an in-flight browser request. Avoid importing `server/services` directly into UI code: it is not a BFF invocation and would bundle server concerns into the client.

The two backend entry directories are **alternative runtime wrappers**, not two backends running at once:

```text
Browser → /api/overview
                │
                ├─ npm run dev/serve → api/lambda/overview.ts
                └─ Cloudflare Pages → functions/api/overview.ts
                                         │
                              server/services/elections.ts
                                         │
                             validated provider adapters
```

There is no official Modern.js Pages adapter in this project. The portable services use Fetch, AbortSignal and JSON rather than Node filesystem or socket APIs.

## 3. Inspect the contracts — 5 minutes

Read `shared/contracts.ts`. Each upstream is `unknown` until parsed. The browser validates the assembled response again. `Feed<T>` is a discriminated union, so a successful feed has data and a failed feed has a message. Components branch on status instead of inventing a zero value.

Now read `shared/races.ts`. Exact market IDs and event tickers are configuration, separate from rendering. This is more reliable than running fuzzy searches on every request: an exchange has primaries, general elections, margin markets and similarly named state legislature events.

Inspect `parseKalshi` and `parsePolymarket`. A null price must never coerce to zero. A Yes outcome need not occupy array index zero. The two parties' quotes need not add to 100%. Those details justify the adapter tests more than snapshotting JSX would.

## 4. Client state and splitting — 5 minutes

Read `src/hooks/use-resource.ts`. It validates JSON, cancels on unmount, prevents superseded requests from winning, exposes a manual refresh trigger and preserves the last good snapshot on a transport/schema failure. A refresh error labels that snapshot as old; its retrieval timestamp does not advance. Source-level failures in an otherwise valid response remain independent feed states.

Local UI state is all this page needs: selected state, map office and watchlist office. Race navigation resets a conflicting filter before scrolling, so a link cannot target a hidden card.

Read `src/features/map/map-section.tsx`. `React.lazy` imports the map, while the toolbar loads only state names and codes. `us-map.tsx` imports the larger path dataset. The production build creates an async chunk for those paths. D3 and TopoJSON are development tools used by `npm run prepare:map`; they are absent from runtime imports.

This uses ordinary React code splitting. You do not need a framework-specific dynamic import wrapper for this CSR map.

## 5. Inspect a production deployment — 5 minutes

Run:

```sh
npm run build:pages
npm run preview:pages
```

Open `http://localhost:8788`. `scripts/package-pages.mjs` copies the generated HTML into a root `index.html` and allows only static assets into `dist/pages`. The Node BFF bundle is left out. Wrangler independently compiles `functions/` for workerd.

Open `/api/races`: the JSON contract matches the development endpoint. Open `/api/not-a-route`: it returns JSON 404, rather than the SPA HTML fallback. This matters because a successful HTML response cannot be treated as valid API data.

## Useful deliberate omissions

No query library for two manually refreshed reads; no state manager for three controls; no charting library for a few bars; no server rendering to complicate a Pages learning project; no database for external public data. These are scope choices, not claims about what Modern.js supports.

The global stylesheet keeps the design tokens and one-page styles easy to inspect. For a larger project, CSS Modules would help isolate independently maintained features. The framework supports both approaches.

The short-lived patch in `scripts/patch-modern-paths.mjs` is an upstream 3.10.3 compatibility fix for this workspace path, not a normal Modern.js setup step. See the README before upgrading.

Primary docs: [quick start](https://modernjs.dev/guides/get-started/quick-start), [BFF functions](https://modernjs.dev/guides/advanced-features/bff/function), [code splitting](https://modernjs.dev/guides/advanced-features/code-splitting), [deployment](https://modernjs.dev/guides/basic-features/deploy).
