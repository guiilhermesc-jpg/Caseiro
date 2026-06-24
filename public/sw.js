const CACHE_VERSION = 'venor-rv18-0-offline-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/launcher.html',
  '/baixar.html',
  '/patch-manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/patches/rv17-1-calabouco-vivo.png',
  '/patches/rv17-2-bichos-premium.png',
  '/patches/rv17-3-interiores-realidade.png',
  '/patches/rv17-4-rotas-continente.png',
  '/patches/rv17-5-moradias-economia.png',
  '/patches/rv17-6-contrato-visual.png',
  '/patches/rv17-7-bases-vivas.png',
  '/patches/rv17-8-hunts-reacao.png',
  '/patches/rv17-9-preparacao-rv18.png',
  '/patches/rv18-grande-pacto.png',
  '/texturas/ceu.png',
  '/texturas/grama.png',
  '/texturas/pedra.png',
  '/texturas/telha.png',
  '/texturas/madeira.png',
  '/texturas/terra.png',
  '/texturas/rocha.png',
  '/texturas/areia.png',
  '/texturas/lava.png',
  '/texturas/muralha.png',
  '/modelos/dragao.glb',
  '/modelos/dragao2.glb'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/cdn-cgi/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(url.pathname === '/' ? '/index.html' : url.pathname, copy));
          return res;
        })
        .catch(() => caches.match(url.pathname === '/' ? '/index.html' : url.pathname)
          .then((cached) => cached || caches.match('/launcher.html'))
          .then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
