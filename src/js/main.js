let restaurants,
    neighborhoods,
    cuisines;
var map;
var markers = [];

/**
 * Register Service Worker.
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service worker registered!'));
}


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    fetchNeighborhoods();
    fetchCuisines();
    updateRestaurants();
    // allow time for restaurants to load before lazyload setup
    setTimeout(lazyLoadMap, 2000);

});
/** add eventListener for favorite star **/

const restaurantList = document.getElementById('restaurants-list');
restaurantList.addEventListener('click', favouriteRestaurant);
restaurantList.addEventListener('keydown', favouriteRestaurant);


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    select.innerHTML = '';
    select.innerHTML = '<option value="all">All Neighborhoods</option>';
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');
    select.innerHTML = '';
    select.innerHTML = '<option value="all">All Cuisines</option>';
    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    resetMap();
    addMarkersToMap();


};


/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
// Remove all map markers
    resetMap();
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {

// Remove all map markers
    const ul = document.getElementById('restaurants-list');
    if (!restaurants.length) {
        ul.innerHTML = '<h2>Sorry no restaurants match that filter.</h2>';
        return;
    }
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    lazyLoadImages();
    addMarkersToMap();
};

/**
 * Remove all markers from map.
 */
resetMap = () => {
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', restaurant.name);
    li.setAttribute('data-id', restaurant.id);

    const like = document.createElement('div');

    like.classList.add('favorite');
    like.setAttribute('tabindex','0');
    if (restaurant.is_favorite === 'true'){
        like.classList.add('favorited');
        like.title = `Remove from favourites`;
    }else{
        like.title = `Add to Favourites`;
    }
    like.innerHTML = `<svg width="30" height="30" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">            
            <polygon class="star" points="10 0.19 7 6.78 0 7.69 5.15 12.66 3.82 19.81 10 16.3 16.18 19.81 14.85 12.66 20 7.69 13 6.78 10 0.19"/>
        </svg>`
    li.appendChild(like);
    const picture = document.createElement('picture');
    picture.innerHTML = DBHelper.pictureElementForRestaurant(restaurant, true);
    li.append(picture);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('address');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Restaurant';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li
};


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    if (window.google) {
        restaurants.forEach(restaurant => {
            // Add marker to the map
            const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
            google.maps.event.addListener(marker, 'click', () => {
                window.location.href = marker.url
            });
            self.markers.push(marker);
        });
    }


};

