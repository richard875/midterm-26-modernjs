# Cloudflare Pages

## What gets deployed

Modern.js's documented server runtime is Node.js. Pages Functions use Cloudflare Workers. Merely uploading a Modern.js Node server build will not make its BFF run on Pages.

This application uses two deployment pieces:

1. Modern.js builds the CSR frontend. `scripts/package-pages.mjs` copies HTML, favicon and hashed static assets into `dist/pages`.
2. Cloudflare compiles `functions/api/*.ts`. These wrappers call the same Web-API-only services used by the native BFF handlers. It does not run `api/lambda` or the Modern.js server at the edge.

`_routes.json` invokes Functions only for `/api/*`. Other requests serve static assets. Unknown API paths return JSON 404 through `functions/api/[[path]].ts`. API responses use `Cache-Control: no-store`; hashed static assets use immutable caching.

## Verify locally

```sh
npm ci
npm run check
npm run build:pages
npm run preview:pages
```

Open `http://localhost:8788`, then test both `/api/overview` and `/api/races`. This runs the production browser bundle and Pages Functions together in workerd, without Cloudflare credentials. External data requests still require internet access.

`wrangler.jsonc` supplies the Pages name, `dist/pages` output directory and runtime compatibility date. There are no Node compatibility flags, secrets, KV, D1, R2 or service bindings.

## Dependency installation failures

If Cloudflare's npm 10 install reports `Missing: zod@3.25.76 from lock file`, regenerate and verify the lockfile with the builder's npm version, then commit `package-lock.json`:

```sh
npx --yes npm@10.9.2 install --package-lock-only --ignore-scripts
npx --yes npm@10.9.2 ci
```

Modern.js's BFF package declares an optional Zod 3 peer alongside this app's Zod 4 dependency. The lockfile must include the nested Zod 3 entry for npm 10's clean install. The separate `react-side-effect` React peer warning does not stop installation.

## Deploy later from the terminal

Run commands **from the repository root** so Wrangler can discover `functions/` and the config. Use an npm installation with devDependencies available during the build; Modern.js, the BFF plugin and Wrangler are build tools.

```sh
npm run build:pages
npx wrangler login
npx wrangler pages project create midterm-26
npx wrangler pages deploy dist/pages --project-name midterm-26
```

Choose your own available project name if `midterm-26` is taken and update `name` in `wrangler.jsonc`. Create the project once. For an existing project, skip the create command and use its name. No deployment or account sign-in was performed while building this repository.

Drag-and-drop static uploads alone do **not** compile the Functions. Use the Wrangler command above or a Git-integrated Pages build.

## Deploy later with Git integration

After you choose to push this repository and connect it to Cloudflare Pages:

| Setting                  | Value                          |
| ------------------------ | ------------------------------ |
| Framework preset         | None                           |
| Project root             | Repository root                |
| Build command            | `npm run build:pages`          |
| Build output directory   | `dist/pages`                   |
| Node version             | 24 (also declared in `.nvmrc`) |
| Runtime secrets/bindings | None                           |

Keep `functions/` at the root. Do not point the project root at `dist/pages`, remove backend source before the build, or deploy the broader `dist` directory as the public root.

## Limits that remain

The APIs are public, free upstream services. Availability, schemas and event identities may change. Calls are bounded to explicit event IDs and two bulk polling requests for the race endpoint, with an eight-second upstream timeout. No persistent cache or application rate limiter is included in this small learning project.

The frontend is client-rendered. Search engines and no-JavaScript visitors receive a basic shell, not a server-rendered election dashboard. If SSR becomes a goal, evaluate a supported Modern.js Node host or a properly tested runtime adapter as a separate change.

Sources: [Modern.js deployment](https://modernjs.dev/guides/basic-features/deploy), [Pages Functions](https://developers.cloudflare.com/pages/functions/), [Functions routing](https://developers.cloudflare.com/pages/functions/routing/), [Wrangler Pages commands](https://developers.cloudflare.com/workers/wrangler/commands/#pages).
