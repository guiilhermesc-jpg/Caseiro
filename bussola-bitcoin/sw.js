/* Bússola — service worker (offline-first do shell + book). */
const CACHE = 'bussola-v34';
const ASSETS = [
  './',
  'index.html',
  'assets/style.css',
  'assets/app.js',
  'assets/vendor/wallet-bundle.js',
  'assets/hero.svg',
  'manifest.webmanifest',
  'icon.svg',
  'docs/00-VISAO.md',
  'docs/01-COMPRAR.md',
  'docs/02-CARTEIRA.md',
  'docs/03-DECLARACAO.md',
  'docs/04-GANHAR-HOJE.md',
  'docs/05-MAPA-HISTORICO.md',
  'docs/06-CARTEIRA-SOBERANA.md',
  'docs/07-NORTE-PRODUTO.md',
  'docs/08-ESTRATEGIA.md',
  'docs/09-SEGURANCA.md',
  'docs/10-GLOSSARIO.md',
  'docs/11-FAQ.md',
  'docs/99-FONTES.md',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Network-first para .md (conteúdo atualiza), cache-first para o resto. */
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const isDoc = request.url.endsWith('.md');
  if (isDoc) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    e.respondWith(
      caches.match(request).then((hit) => hit || fetch(request))
    );
  }
});
