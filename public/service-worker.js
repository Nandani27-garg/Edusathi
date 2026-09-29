/**
 * EduSaarthi - Service Worker
 * Provides offline caching for static assets, pages, and learning modules.
 */

const CACHE_NAME = 'edusaarthi-core-v1';

const STATIC_ASSETS = [
  '/',
  '/css/main.css',
  '/js/main.js',
  '/js/offline-storage.js',
  '/images/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Do not intercept non-GET requests or external API calls to Gemini
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/ai/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset if available
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // If network succeeds and valid response, update cache for static assets or lesson views
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached response if present
          if (cachedResponse) return cachedResponse;

          // If navigation request and no cache, return offline shell
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
