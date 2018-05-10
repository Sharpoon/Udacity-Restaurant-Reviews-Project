/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get RESTAURANTS_URL() {
        return 'http://localhost:1337/restaurants';
    }

    static get REVIEWS_URL() {
        return 'http://localhost:1337/reviews';
    }

    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        // Try IDB first for speed
        if ('indexedDB' in window) {
            iDBFetchData('restaurants-store')
                .then(function (data) {
                    if (data.length > 0) {
                        return callback(null, data)
                    }
                })
                // Also try to fetch from network
                .then(()=>{
                    fetch(DBHelper.RESTAURANTS_URL)
                        .then((response) => response.json())
                        .then((data) => callback(null, data))
                })
        }else{
            fetch(DBHelper.RESTAURANTS_URL)
                .then((response) => response.json())
                .then((data) => callback(null, data))
        }

    }



    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     *
     * @param restaurant
     * @param homepage/ boolean
     * @returns {string}
     */
    static pictureElementForRestaurant(restaurant, homepage) {
        let sizes;
        homepage ? sizes = "(max-width: 524px) 400px, (max-width: 774px) 650px,  270px" : sizes = "(max-width: 394px) 270px, (max-width: 1064px) 650px, (min-width: 1065px) 800px, 800px";
        return `            
                <source type="image/webp"
                    data-webp-srcset="dist/img/${restaurant.id}-270.webp 270w,
                dist/img/${restaurant.id}-400.webp 400w,
                dist/img/${restaurant.id}-650.webp 650w,
                dist/img/${restaurant.id}.webp 800w"
                sizes="${sizes}"
                />
                <source data-jpeg-srcset="dist/img/${restaurant.id}-270.jpg 270w,
                dist/img/${restaurant.id}-400.jpg 400w,
                dist/img/${restaurant.id}-650.jpg 650w,
                dist/img/${restaurant.id}.jpg 800w"
                sizes="${sizes}"
                />
                             
                <img data-img-src="dist/img/${restaurant.id}.jpg" class="restaurant-img" alt="Image of the ${restaurant.name} restaurant" />`;
    }


    /**
     * Output sizes attribute for restaurant page images
     * @returns {string}
     */
    static restaurantImageSizes() {
        return (`(max-width: 394px) 270px, (max-width: 1064px) 650px, (min-width: 1065px) 800px, 800px`);
    }


    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        if (window.google) {
            const marker = new google.maps.Marker({
                    position: restaurant.latlng,
                    title: restaurant.name,
                    url: DBHelper.urlForRestaurant(restaurant),
                    map: map,
                    animation: google.maps.Animation.DROP
                }
            );
            return marker;
        }

    }

}
