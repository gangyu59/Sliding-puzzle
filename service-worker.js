self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('knights-tour-cache').then((cache) => {
            return cache.addAll([
                './index.html',
                './style.css',
                './main.js',
                './manifest.json',
                './service-worker.js',
                './icon-192.png', // Include the icon files as well
                './icon-512.png'  // Include the icon files as well
            ]);
        }).catch(error => {
            console.error('Caching failed:', error);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(error => {
            console.error('Fetching failed:', error);
        })
    );
});