import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

// Modern.js's default CSR HTML is nested; Workers static assets expect a root index.html.
// Copy an allowlist, never the Node server bundle or server configuration.
const output = new URL('../dist/pages/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../dist/static/', import.meta.url), new URL('static/', output), {
  recursive: true,
});
const html = await readFile(new URL('../dist/html/index/index.html', import.meta.url), 'utf8');
await writeFile(new URL('index.html', output), html);
await cp(new URL('../public/favicon.svg', import.meta.url), new URL('favicon.svg', output));
await writeFile(
  new URL('_headers', output),
  '/static/*\n  Cache-Control: public, max-age=31536000, immutable\n',
);
console.log(
  'Cloudflare static assets prepared in dist/pages. The API Worker is bundled from worker/.',
);
