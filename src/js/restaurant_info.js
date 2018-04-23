let restaurant;
let map;
let reviews;
/**
 * Register Service Worker.
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service worker registered!'));
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });

};


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
        // Fetch reviews
        // Try IDB first for speed
        if ('indexedDB' in window) {
            iDBFetchReviewsByID(id)
                .then((data) => {
                    if (data.length > 0) {
                        fillReviewsHTML(data);
                    } else {
                        fetchReviewsFromNetwork(id);
                    }
                })
        } else {

            // Also try to fetch from network
            fetchReviewsFromNetwork(id);
        }


    }
};
/**
 * Fetch reviews by id from network.
 * @param id
 */
fetchReviewsFromNetwork = (id) => {
    const reviewsEndpoint = `${DBHelper.REVIEWS_URL}/?restaurant_id=${id}`;
    fetch(reviewsEndpoint)
        .then((response) => response.json())
        .then((data) => {
            if (data.length > 0) {
                fillReviewsHTML(data);
            }
        })
        .catch((err) => console.log(err));
};


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const picture = document.getElementById('restaurant-img');
    picture.innerHTML = DBHelper.pictureElementForRestaurant(restaurant, false);


    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    lazyLoadImages();

};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    hours.innerHTML = '';
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
    const container = document.getElementById('reviews-container');
    // container.innerHTML = '';
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.createElement('ul');
    ul.id = 'reviews-list';

    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', 'Restaurant review');
    const header = document.createElement('header');
    li.appendChild(header);
    const name = document.createElement('p');

    name.innerHTML = review.name;
    header.appendChild(name);

    const date = document.createElement('p');
    const reviewDate = new Date(review.createdAt);
    date.innerHTML = reviewDate.toLocaleDateString();
    header.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    if (breadcrumb.firstElementChild.nextElementSibling) {
        breadcrumb.removeChild(breadcrumb.firstElementChild.nextElementSibling)
    }
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/** Review Modal **/
const modal = document.getElementById('user-review');
const modalToggle = modal.querySelector('#review-modal-trigger');
const reviewForm = modal.querySelector('#user-review-form');

// lock focus to modal
modalToggle.addEventListener('keydown', (e) => {
    if (e.keyCode === 9 && reviewForm.classList.contains('visible')) {
        e.preventDefault();
        reviewForm.name.focus();
    }

});
// Close modal with escape key
document.addEventListener('keydown',(e)=>{
    if (e.keyCode === 27 && reviewForm.classList.contains('visible')) {
        reviewForm.classList.remove('visible');
        modalClose();
    }
});
// Control modal visibility
modalToggle.addEventListener('click', () => {
    reviewForm.scrollIntoView();
    reviewForm.classList.toggle('visible');
    if(reviewForm.classList.contains('visible')){
        modalOpen();
    } else{
        modalClose();
    }
    setTimeout(() => {
        reviewForm.name.focus();
    }, 500);
});

/**
 * Actions when modal is opened.
 */
function modalOpen(){
    modal.setAttribute('aria-hidden','false');
    modalToggle.innerText = 'Close';
    modalToggle.setAttribute('aria-label','close');
}

/**
 * Actions when modal is closed.
 */
function modalClose(){
    modal.setAttribute('aria-hidden','true');
    modalToggle.innerText = 'Leave a Review';
    modalToggle.removeAttribute('aria-label');
}



