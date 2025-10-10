/* Service Worker for Laundry PWA */
const CACHE_VERSION = 'laundry-pwa-v1-20251010';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_VERSION) && caches.delete(k))))
  );
  self.clients.claim();
});

/* Strategy:
 * - Same-origin: cache-first
 * - CDN (jsdelivr, cdnjs, fonts.googleapis.com/gstatic, tailwindcss): stale-while-revalidate
 */
const CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.tailwindcss.com', 'cdn.jsdelivr.net'];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  if (url.origin === location.origin) {
    // cache first for own assets
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        return res;
      }))
    );
  } else if (CDN_HOSTS.includes(url.host)) {
    // stale-while-revalidate for CDN
    event.respondWith(
      caches.match(req).then(cached => {
        const fetchPromise = fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
