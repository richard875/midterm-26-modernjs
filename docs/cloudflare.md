# Cloudflare Workers

## What gets deployed

Modern.js's documented server runtime is Node.js. Cloudflare Workers is not Node, so uploading a Modern.js Node server build will not make its BFF run there.

This application uses two deployment pieces:

1. Modern.js builds the CSR frontend. `npm run build` then runs `scripts/package-pages.mjs`, which copies HTML, favicon and hashed static assets into `dist/pages`.
2. Wrangler bundles `worker/index.ts`. It calls the same Web-API-only services used by the native BFF handlers. It does not run `api/lambda` or the Modern.js server at the edge.

`wrangler.jsonc` serves `dist/pages` as static assets and runs the Worker first only for `/api/*`. Other paths get the asset or, for client routes, the SPA `index.html`. Unknown API paths return a JSON 404 rather than the SPA shell; non-GET requests return 405. API responses use `Cache-Control: no-store`; hashed static assets use immutable caching via `_headers`.

## Verify locally

```sh
npm ci
npm run check
npm run build
npm run preview
```

Open `http://localhost:8788`, then test both `/api/overview` and `/api/races`. This runs the production browser bundle and the Worker together in workerd, without Cloudflare credentials. External data requests still require internet access.

`wrangler.jsonc` supplies the Worker name, entry point, assets directory and runtime compatibility date. There are no Node compatibility flags, secrets, KV, D1, R2 or service bindings beyond the `ASSETS` binding.

## Dependency installation failures

If Cloudflare's npm 10 install reports `Missing: zod@3.25.76 from lock file`, regenerate and verify the lockfile with the builder's npm version, then commit `package-lock.json`:

```sh
npx --yes npm@10.9.2 install --package-lock-only --ignore-scripts
npx --yes npm@10.9.2 ci
```

Modern.js's BFF package declares an optional Zod 3 peer alongside this app's Zod 4 dependency. The lockfile must include the nested Zod 3 entry for npm 10's clean install. The separate `react-side-effect` React peer warning does not stop installation.

## Deploy from the terminal

Run commands **from the repository root** so Wrangler finds the config. Use an npm installation with devDependencies available during the build; Modern.js, the BFF plugin and Wrangler are build tools.

```sh
npm run build
npx wrangler login
npx wrangler deploy
```

Choose your own available Worker name if `midterm-26` is taken and update `name` in `wrangler.jsonc`.

## Deploy with Git integration (Workers Builds)

| Setting                  | Value                          |
| ------------------------ | ------------------------------ |
| Root directory           | Repository root                |
| Build command            | `npm run build`                |
| Deploy command           | `npx wrangler deploy`          |
| Node version             | 24 (also declared in `.nvmrc`) |
| Runtime secrets/bindings | None                           |

The Worker name in the Cloudflare dashboard must match `name` in `wrangler.jsonc`. Do not deploy the broader `dist` directory as the assets root; it contains the Modern.js server bundle.

## Limits that remain

The APIs are public, free upstream services. Availability, schemas and event identities may change. Calls are bounded to explicit event IDs and two bulk polling requests for the race endpoint, with an eight-second upstream timeout. No persistent cache or application rate limiter is included in this small learning project.

The frontend is client-rendered. Search engines and no-JavaScript visitors receive a basic shell, not a server-rendered election dashboard. If SSR becomes a goal, evaluate a supported Modern.js Node host or a properly tested runtime adapter as a separate change.

Sources: [Modern.js deployment](https://modernjs.dev/guides/basic-features/deploy), [Workers static assets](https://developers.cloudflare.com/workers/static-assets/), [Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/), [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).
