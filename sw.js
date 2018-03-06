const CACHE_STATIC = 'static-v2';
const CACHE_DYNAMIC = 'dynamic-v2';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/css/styles.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
                    '/js/dbhelper.js',
                    '/js/main.js',
                    '/data/restaurants.json',
                ]);
            })
    )
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(CACHE_DYNAMIC)
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        })
                        .catch((err) => {

                        });
                }
            })
    );
});

