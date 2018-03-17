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