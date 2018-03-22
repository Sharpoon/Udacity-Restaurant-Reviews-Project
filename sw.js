importScripts('dist/js/common.min.js');


const CACHE_STATIC = 'static-v3';
const CACHE_DYNAMIC = 'dynamic-v3';
const JSON_URL = 'http://localhost:1337/restaurants';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',

                    '/dist/js/dbhelper.min.js',
                    '/dist/js/main.min.js',
                    '/dist/js/common.min.js',

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
            }),
        fetch(JSON_URL)
            .then((response) => response.json())
            .then(
                (data) => iDBAddData(data)
            )
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {

    if (event.request.url.startsWith(JSON_URL)) {
        event.respondWith(
            // Store updated response in indexedDB
            fetch(event.request)
                .then(function (response) {
                    const clonedResponse = response.clone();
                    // Clear data store
                    iDBClearAllData()
                        .then(function () {
                            return clonedResponse.json();
                        })
                        .then(function (restaurantsData) {
                            // Add fresh data to the store
                            iDBAddData(restaurantsData);
                        });

                    return response;
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    else {
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

    }
});



