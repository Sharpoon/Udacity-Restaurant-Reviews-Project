importScripts('dist/js/common.min.js');


const CACHE_STATIC = 'static-v3';
const CACHE_DYNAMIC = 'dynamic-v3';
const RESTAURANTS_URL = 'http://localhost:1337/restaurants';
const REVIEWS_URL = 'http://localhost:1337/reviews';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/restaurant.html',
                    '/dist/js/common.min.js',
                    '/dist/js/restaurant_info.min.js',
                    '/dist/js/dbhelper.min.js',
                    '/dist/js/main.min.js',
                    '/dist/css/styles.min.css',
                    '/dist/css/restaurant_details.min.css'
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
        // Store restaurants in DB
        fetch(RESTAURANTS_URL)
            .then((response) => response.json())
            .then((data) => iDBAddData(data,'restaurants-store'))
            .catch((err)=>console.log(err)),
        // Store reviews in DB
        fetch(REVIEWS_URL)
            .then((response) => response.json())
            .then((data) => iDBAddData(data,'reviews-store'))
            .catch((err)=>console.log(err))


    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {

    if (event.request.url.startsWith(RESTAURANTS_URL)) {
        event.respondWith(
            // Store updated response in indexedDB
            fetch(event.request)
                .then(function (response) {
                    const clonedResponse = response.clone();
                    // Clear data store
                    iDBClearAllData('restaurants-store')
                        .then(function () {
                            return clonedResponse.json();
                        })
                        .then(function (restaurantsData) {
                            // Add fresh data to the store
                            iDBAddData(restaurantsData,'restaurants-store');
                        });

                    return response;
                })
        );
    } else if (event.request.url.startsWith(REVIEWS_URL)) {
        // Restaurant reviews request
        event.respondWith(
            fetch(event.request)
                .then(function (response) {
                    const clonedResponse = response.clone();
                    clonedResponse.json()
                        .then((data)=>{
                        // Store updated response in indexedDB if available
                            iDBAddData(data,'reviews-store');
                        });

                    return response;
                })
        );
    }
    else {
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



