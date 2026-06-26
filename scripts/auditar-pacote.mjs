import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const raiz = path.resolve('dist');
const perfilPath = path.resolve('public/install-profile.json');
const strict = process.argv.includes('--strict');

if (!existsSync(raiz)) {
  console.error('dist nao existe. Rode npm run build antes de auditar o pacote.');
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const files = await walk(raiz);
const rows = [];
for (const full of files) {
  const s = await stat(full);
  const rel = '/' + path.relative(raiz, full).replaceAll('\\', '/');
  const ext = path.extname(full).toLowerCase();
  let gzip = 0;
  if (['.js', '.css', '.html', '.json', '.svg'].includes(ext)) {
    gzip = gzipSync(await readFile(full)).length;
  }
  rows.push({ path: rel, bytes: s.size, gzip });
}

const total = rows.reduce((acc, r) => acc + r.bytes, 0);
const jsGzip = rows.filter((r) => r.path.endsWith('.js')).reduce((acc, r) => acc + r.gzip, 0);
let budgets = {};
try {
  budgets = JSON.parse(await readFile(perfilPath, 'utf8')).budgets || {};
} catch {}

const mb = (n) => +(n / 1024 / 1024).toFixed(2);
const top = rows.slice().sort((a, b) => b.bytes - a.bytes).slice(0, 10)
  .map((r) => ({ path: r.path, mb: mb(r.bytes), gzipMb: mb(r.gzip) }));

const report = {
  files: rows.length,
  totalMb: mb(total),
  jsGzipMb: mb(jsGzip),
  webPreviewInitialJsGzipBudgetMb: budgets.webPreviewInitialJsGzipMb ?? null,
  installedCoreAssetsBudgetMb: budgets.installedCoreAssetsMb ?? null,
  status: {
    jsGzip: budgets.webPreviewInitialJsGzipMb && mb(jsGzip) > budgets.webPreviewInitialJsGzipMb ? 'acima_do_orcamento_web' : 'ok',
    installedCore: budgets.installedCoreAssetsMb && mb(total) > budgets.installedCoreAssetsMb ? 'acima_do_core_instalado' : 'ok',
  },
  top,
};

console.log(JSON.stringify(report, null, 2));

if (strict && report.status.installedCore !== 'ok') process.exitCode = 1;
