/**
 * Setup IDB for restaurants JSON storage
 * @type {*|Promise<Cache>|void|IDBOpenDBRequest|Window|Document}
 */
let dbPromise = idb.open('restaurant-reviews', 1, function (db) {
    if (!db.objectStoreNames.contains('restaurants-store')) {
        db.createObjectStore('restaurants-store', {keyPath: 'id'});
    }
    if (!db.objectStoreNames.contains('reviews-store')) {
        let reviewStore = db.createObjectStore('reviews-store', {keyPath: 'id'});
        reviewStore.createIndex('restaurant', 'restaurant_id');
    }
    if (!db.objectStoreNames.contains('reviews-sync-store')) {
        db.createObjectStore('reviews-sync-store', {keyPath: 'createdAt'});
    }
});

/**
 * Add data to restaurants store in IDB
 * @param data
 * @param objectStore
 * @returns {Promise}
 */
function iDBAddData(data, objectStore) {
    return dbPromise.then(function (db) {
        if (!db) return;
        const tx = db.transaction(objectStore, 'readwrite');
        const store = tx.objectStore(objectStore);
        if (Array.isArray(data)) {
            data.forEach(function (restaurant) {
                store.put(restaurant);
                return tx.complete;
            });
        } else {
            store.put(data);
            return tx.complete;
        }

    });
}

/**
 * Fetch all data from restaurants store in IDB
 * @returns {Promise}
 */
function iDBFetchData(objectStore) {
    return dbPromise.then(function (db) {
        if (!db) return;
        const tx = db.transaction(objectStore, 'readonly');
        const store = tx.objectStore(objectStore);
        return store.getAll();
    });
}

/**
 * Fetch all data for restaurant by id in IDB store
 * @returns {Promise}
 */
function iDBFetchReviewsByID(restaurantID) {
    return dbPromise.then(function (db) {

        if (!db) return;
        const tx = db.transaction('reviews-store', 'readonly');
        const store = tx.objectStore('reviews-store');

        const dbIndex = store.index('restaurant');

        return dbIndex.getAll(parseInt(restaurantID));

    });
}

/**
 * Remove all data from restaurants store in IDB
 * @returns {Promise}
 */
function iDBClearAllData(objectStore) {
    return dbPromise
        .then(function (db) {
            const tx = db.transaction(objectStore, 'readwrite');
            const store = tx.objectStore(objectStore);
            store.clear();
            return tx.complete;
        });
}

function iDBDeleteItem(objectStore, id) {
    dbPromise
        .then((db) => {
            const tx = db.transaction(objectStore, 'readwrite');
            const store = tx.objectStore(objectStore);
            store.delete(id);
            return tx.complete;
        });

}

/**
 * Use an IntersectionObserver to lazyload Google Map.
 */
function lazyLoadMap() {
    const map = document.querySelector('#map');
    const mapScriptTag = document.createElement('script');
    mapScriptTag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAn0CqkAymgcb7syjdi0ke0GPu_OFPTKVk&libraries=places&callback=initMap';
    if (!('IntersectionObserver' in window)) {
        document.body.appendChild(mapScriptTag);
        return;

    }
    const config = {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.1
    };


    let mapObserver = new IntersectionObserver(function (entries, self) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log(entry.isIntersecting);
                document.body.appendChild(mapScriptTag);
                self.unobserve(entry.target);
            }
        });
    }, config);

    mapObserver.observe(map);
}

/**
 * Use an IntersectionObserver to lazyload images.
 */
function lazyLoadImages() {
    const pictures = document.querySelectorAll('picture');
    if (!('IntersectionObserver' in window)) {
        pictures.forEach(picture => {
            loadImage(picture);
        });
        return;

    }
    const config = {
        rootMargin: '-200px 0px 0px 0px',
        threshold: 0.5
    };

    let observer = new IntersectionObserver(function (entries, self) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                self.unobserve(entry.target);
            }
        });
    }, config);

    pictures.forEach(picture => {
        observer.observe(picture);
    });
}

/**
 * Update picture element src and srcset
 * @param picture
 */
function loadImage(picture) {

    const webpSrcSet = picture.children[0].getAttribute('data-webp-srcset');
    const jpegSrcSet = picture.children[1].getAttribute('data-jpeg-srcset');
    const imgSrc = picture.children[2].getAttribute('data-img-src');
    if (!imgSrc) {
        return;
    }
    picture.children[0].srcset = webpSrcSet;
    picture.children[1].srcset = jpegSrcSet;
    picture.children[2].src = imgSrc;
}

/**
 * onClick handler for restaurants favorites feature.
 * @param e
 */
function favouriteRestaurant(e) {
    if (e.target.classList.contains('favorite')) {
        if (e.type === 'keydown' && e.keyCode !== 13) {
            return;
        }
        const restaurantID = e.target.parentElement.dataset.id;
        if (e.target.classList.contains('favorited')) {
            fetch(`http://localhost:1337/restaurants/${restaurantID}/?is_favorite=false`, {
                method: 'POST'
            })
                .then((res) => {
                    e.target.classList.remove('favorited');
                    e.target.title = `Add to Favourites`;
                })
                .catch((e) => alert('Can not connect to server. Please try later.'));
        } else {
            fetch(`http://localhost:1337/restaurants/${restaurantID}/?is_favorite=true`, {
                method: 'POST'
            })
                .then((res) => {
                    e.target.classList.add('favorited');
                    e.target.title = `Remove from Favourites`;
                })
                .catch((e) => alert('Can not connect to server. Please try later.'));
        }
    }
}

