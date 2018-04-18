/**
 * Setup IDB for restaurants JSON storage
 * @type {*|Promise<Cache>|void|IDBOpenDBRequest|Window|Document}
 */
let dbPromise = idb.open('restaurant-reviews', 1, function (db) {
    if (!db.objectStoreNames.contains('restaurants-store')) {
        db.createObjectStore('restaurants-store', {keyPath: 'id'});
    }
});

/**
 * Add data to restaurants store in IDB
 * @param data
 * @returns {Promise}
 */
function iDBAddData(data) {
    return dbPromise.then(function (db) {
        if (!db) return;
        const tx = db.transaction('restaurants-store', 'readwrite');
        const store = tx.objectStore('restaurants-store');
        data.forEach(function (restaurant) {
            store.put(restaurant);
            return tx.complete;
        });
    });
}

/**
 * Fetch all data from restaurants store in IDB
 * @returns {Promise}
 */
function iDBFetchData() {
    return dbPromise.then(function (db) {
        if (!db) return;
        const tx = db.transaction('restaurants-store', 'readonly');
        const store = tx.objectStore('restaurants-store');
        return store.getAll();
    });
}

/**
 * Remove all data from restaurants store in IDB
 * @returns {Promise}
 */
function iDBClearAllData() {
    return dbPromise
        .then(function(db) {
            const tx = db.transaction('restaurants-store', 'readwrite');
            const store = tx.objectStore('restaurants-store');
            store.clear();
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
    if (!imgSrc ) { return; }
    picture.children[0].srcset = webpSrcSet;
    picture.children[1].srcset = jpegSrcSet;
    picture.children[2].src = imgSrc;
}

