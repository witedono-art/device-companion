// sw.js
const CACHE_NAME = 'companion-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(['./', './index.html']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Update cache in background
        fetch(event.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
          }
        }).catch(() => { /* ignore network errors */ });
        return cached;
      }
      return fetch(event.request);
    })
  );
});
