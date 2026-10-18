/**
 * Marsa Alam Ground Handling SQMS Service Worker
 * Enables offline capability and background sync for remote airport locations
 */

const CACHE_NAME = 'rmf-sqms-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 1. Install event: pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: Stale-while-revalidate or Network-first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and not in cache, fallback to index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Background Sync event (fired when connection is restored)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-safety-reports') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TRIGGER_OFFLINE_SYNC',
            timestamp: new Date().toISOString()
          });
        });
      })
    );
  }
});

// 5. Message event for bi-directional communication with app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING') {
    event.ports[0]?.postMessage({ status: 'PONG', cache: CACHE_NAME });
  }
});
