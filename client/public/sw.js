const CACHE_NAME = 'tsmooth-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API/socket calls
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) return;

  // Network first for navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'T-Smooth', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || '/'));
});
