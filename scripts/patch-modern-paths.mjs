import { readFile, writeFile } from 'node:fs/promises';

// Modern.js 3.10.3 turns a file URL into a path with `.pathname`, leaving %20
// escaped. This workspace has spaces. Patch just that conversion in the pinned
// dependency; fail visibly if a future release changes the implementation.
for (const relative of ['esm-node/cli/require.mjs']) {
  const path = new URL(`../node_modules/@modern-js/utils/dist/${relative}`, import.meta.url);
  let source = await readFile(path, 'utf8');
  if (source.includes('/* midterm-path-fix */')) continue;
  const pattern =
    /((?:\(0, )?\w+\.moduleResolve\)?\(name, .*?conditions, false\)|moduleResolve\(name, .*?conditions, false\))\.pathname/g;
  let replacements = 0;
  source = source.replace(pattern, (match) => {
    replacements++;
    return `/* midterm-path-fix */ decodeURIComponent(${match})`;
  });
  if (replacements !== 1)
    throw new Error(`Review Modern.js path workaround: ${relative} (${replacements} matches)`);
  await writeFile(path, source);
}
console.log('Applied Modern.js 3.10.3 path-with-spaces workaround.');
