const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "./styles.css",
    "./index.js",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
]

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addEventListener("install", e => {
    console.log("Installed!");
    e.waitUntil(
        caches.open("static")
            .then(cache => {
                cache.addAll(FILES_TO_CACHE)
                    .then(self.skipWaiting())
            })
    );
});

self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cNames) => {
                return cNames.filter((cName) => !currentCaches.includes(cName));
            })
            .then((deleteCaches) => {
                return Promise.all(
                    deleteCaches.map((deletedCache) => {
                        return caches.delete(deletedCache);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});
