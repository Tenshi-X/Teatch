import { mkdirSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
// Use an isolated cache and prepare output parents in the main process.
// Some Windows sandbox build workers cannot create these nested directories.
const source = resolve('app'),
  output = resolve('.next-verify/server/app');
function prepare(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  if (entries.some((e) => e.name === 'page.tsx')) {
    const route = relative(source, dir);
    const publicRoute = route
      .split(/[\\/]/)
      .filter((p) => !p.startsWith('('))
      .join('/');
    mkdirSync(join(output, route), { recursive: true });
    if (!publicRoute.includes('['))
      mkdirSync(join(output, (publicRoute || 'index') + '.segments', route), {
        recursive: true,
      });
  }
  for (const entry of entries)
    if (entry.isDirectory()) prepare(join(dir, entry.name));
}
prepare(source);
for (const route of ['_not-found', '_global-error'])
  mkdirSync(join(output, route + '.segments', route), { recursive: true });
const result = spawnSync(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'build', '--webpack'],
  { stdio: 'inherit', env: { ...process.env, TEATCH_ISOLATED_BUILD: 'true' } }
);
process.exitCode = result.status ?? 1;
