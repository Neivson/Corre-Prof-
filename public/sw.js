const CACHE_NAME = 'corre-prof-v7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.png',
  './icon-192.png',
  './icon-512.png',
  './screenshot-mobile.png',
  './screenshot-desktop.png',
  './manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Initial caching skipped or partial:', err);
      });
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass service worker interception for Vite dev server assets
  const url = new URL(event.request.url);
  if (
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@id') ||
    url.pathname.includes('/node_modules') ||
    url.pathname.includes('/src/') ||
    url.searchParams.has('import') ||
    url.searchParams.has('t') ||
    url.searchParams.has('v')
  ) {
    return;
  }

  // Network-First for HTML navigation, manifest, and service worker to ensure quick updates and avoid stale asset mismatch (white screens)
  const isHtmlOrConfig = 
    event.request.mode === 'navigate' || 
    url.pathname === '/' || 
    url.pathname.endsWith('/index.html') ||
    event.request.url.includes('manifest.json') || 
    event.request.url.includes('sw.js');

  if (isHtmlOrConfig) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-First for other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        // Cache new successful responses dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch((err) => {
        // Rethrow the error so that the browser handles network failures properly
        // instead of receiving an undefined Response which causes a TypeError/Script error
        throw err;
      });
    })
  );
});
