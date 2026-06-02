const CACHE = 'tracker-v15';
const ASSETS = [
  '/edesia/',
  '/edesia/index.html',
  '/edesia/manifest.json',
  '/edesia/icons/icon-192.png',
  '/edesia/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Never cache API calls or fonts
  if (
    e.request.url.includes('anthropic.com') ||
    e.request.url.includes('api.github.com') ||
    e.request.url.includes('fonts.gstatic.com') ||
    e.request.url.includes('fonts.googleapis.com')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type !== 'opaque') {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return res;
    }))
  );
});
