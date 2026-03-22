// ─── Cache version – bump this string on every release to force cache refresh ───
const CACHE_NAME = 'sliding-puzzle-v2';

const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './service-worker.js',
    './icon-192.png',
    './icon-512.png',
];

// ─── Install: pre-cache all assets, activate immediately ───────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()) // take control without waiting
            .catch((err) => console.error('[SW] Pre-cache failed:', err))
    );
});

// ─── Activate: remove old caches, claim all clients ────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                )
            )
            .then(() => self.clients.claim()) // control all open tabs immediately
    );
});

// ─── Fetch: cache-first with network fallback ───────────────────────────────
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request)
                .then((response) => {
                    // Cache successful responses for future use
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch((err) => console.error('[SW] Fetch failed:', err));
        })
    );
});
