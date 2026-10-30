import { build } from 'esbuild';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createServer } from 'node:http';
const folder = resolve('tmp/runtime-qa');
async function main() {
  await mkdir(folder, { recursive: true });
  await build({
    entryPoints: ['tests/browser-preview.tsx'],
    outfile: resolve(folder, 'preview.js'),
    bundle: true,
    platform: 'browser',
    jsx: 'automatic',
    alias: { '@': resolve('.') },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: [
      {
        name: 'offline-mocks',
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(?:@\/app\/actions\/|@\/lib\/supabase\/client$|next\/navigation$|next\/link$)/,
            },
            () => ({ path: resolve('tests/browser-mocks.tsx') })
          );
        },
      },
    ],
  });
  const staticRoot = resolve(
    process.env.TEATCH_ISOLATED_BUILD === 'true'
      ? '.next-verify/static'
      : '.next/static'
  );
  const styles = (await readdir(staticRoot, { recursive: true })).filter((n) =>
    n.endsWith('.css')
  );
  const css = (
    await Promise.all(
      styles.map((n) => readFile(resolve(staticRoot, n), 'utf8'))
    )
  ).join('\n');
  await writeFile(resolve(folder, 'styles.css'), css);
  const html =
    '<html lang="id"><head><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="stylesheet" href="/styles.css"/></head><body><div id="root"></div><script src="/preview.js"></script></body></html>';
  const requests = new Map<string, { status: string; worksheetId?: string }>();
  let operations = 0,
    statusReads = 0;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const json = (data: unknown, status = 200) => {
      res.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      });
      res.end(JSON.stringify(data));
    };
    if (url.pathname === '/api/qa/metrics') {
      json({ operations, statusReads });
      return;
    }
    if (url.pathname === '/api/ai/generation-status') {
      statusReads++;
      const row = requests.get(url.searchParams.get('requestKey') || '');
      json(
        row
          ? {
              ...row,
              message:
                row.status === 'reserved'
                  ? 'Draf masih diproses. Hasil diperiksa otomatis.'
                  : 'Draf tersimpan.',
            }
          : { status: 'not_found', message: 'Permintaan belum ditemukan.' }
      );
      return;
    }
    if (url.pathname === '/api/ai/generate' && req.method === 'POST') {
      try {
        let text = '';
        for await (const chunk of req) {
          text += chunk;
          if (text.length > 5000) throw Error('body');
        }
        const { requestKey } = JSON.parse(text);
        if (!requests.has(requestKey)) {
          operations++;
          requests.set(requestKey, { status: 'reserved' });
          setTimeout(
            () =>
              requests.set(requestKey, {
                status: 'succeeded',
                worksheetId: '33333333-3333-4333-8333-333333333333',
              }),
            6000
          );
        }
        json(
          {
            error:
              'Sambungan contoh terputus setelah permintaan diterima. Hasil akan diambil lewat status.',
            retrySameKey: true,
          },
          503
        );
      } catch {
        json({ error: 'Bad request' }, 400);
      }
      return;
    }
    try {
      if (url.pathname === '/preview.js' || url.pathname === '/styles.css') {
        res.setHeader(
          'content-type',
          url.pathname.endsWith('.js') ? 'text/javascript' : 'text/css'
        );
        res.end(await readFile(resolve(folder, '.' + url.pathname)));
        return;
      }
      if (/\.(png|woff2|svg)$/.test(url.pathname)) {
        const file = resolve('public', '.' + url.pathname);
        if (!file.startsWith(resolve('public') + sep)) throw Error('path');
        res.setHeader(
          'content-type',
          extname(file) === '.png'
            ? 'image/png'
            : extname(file) === '.svg'
              ? 'image/svg+xml'
              : 'font/woff2'
        );
        res.end(await readFile(file));
        return;
      }
      res.setHeader('content-type', 'text/html');
      res.end(html);
    } catch {
      res.writeHead(404).end();
    }
  });
  server.listen(3003, '127.0.0.1', () =>
    console.log('Offline runtime QA: http://127.0.0.1:3003/worksheets/new')
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
