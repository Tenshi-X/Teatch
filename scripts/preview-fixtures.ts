import { build } from 'esbuild';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createServer } from 'node:http';
async function main() {
  const folder = resolve('tmp/qa');
  await mkdir(folder, { recursive: true });
  await build({
    entryPoints: ['tests/preview.tsx'],
    outfile: resolve(folder, 'preview.js'),
    bundle: true,
    platform: 'browser',
    jsx: 'automatic',
    alias: { '@': resolve('.') },
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  const chunks = resolve('.next/static/chunks');
  const styles = (await readdir(chunks)).filter((n) => n.endsWith('.css'));
  const css = (
    await Promise.all(styles.map((n) => readFile(resolve(chunks, n), 'utf8')))
  ).join('\n');
  await writeFile(resolve(folder, 'styles.css'), css);
  await writeFile(
    resolve(folder, 'index.html'),
    '<html lang="id"><head><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/styles.css"/></head><body><div id="root"></div><script src="/preview.js"></script></body></html>'
  );
  const server = createServer(async (req, res) => {
    try {
      const file = resolve(
        folder,
        '.' +
          (req.url === '/'
            ? '/index.html'
            : new URL(req.url || '/', 'http://localhost').pathname)
      );
      if (!file.startsWith(folder + sep)) {
        res.writeHead(403).end();
        return;
      }
      res.setHeader(
        'Content-Type',
        extname(file) === '.js'
          ? 'text/javascript'
          : extname(file) === '.css'
            ? 'text/css'
            : 'text/html'
      );
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  server.listen(3002, '127.0.0.1', () =>
    console.log('Fixture preview: http://127.0.0.1:3002')
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
