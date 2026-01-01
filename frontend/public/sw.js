// Service Worker for offline support and caching
const CACHE_NAME = "philanthropical-v1";
const RUNTIME_CACHE = "philanthropical-runtime-v1";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/donate",
  "/transparency",
  "/offline", // Offline fallback page
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache API responses and static assets
          if (
            event.request.url.includes("/api/") ||
            event.request.url.includes("/_next/static/")
          ) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // If network fails and it's a navigation request, show offline page
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
    })
  );
});

// Background sync for offline actions (if needed)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-donations") {
    event.waitUntil(syncDonations());
  }
});

async function syncDonations() {
  // Implement offline donation sync logic here
  // This would sync any donations made while offline
}

