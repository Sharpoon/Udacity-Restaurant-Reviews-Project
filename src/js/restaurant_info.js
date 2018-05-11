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

/** add eventListener for favorite star **/
const favoriteStar = document.getElementById('restaurant-container');
favoriteStar.addEventListener('click', favouriteRestaurant);
favoriteStar.addEventListener('keydown', favouriteRestaurant);


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const restaurantInfo = document.querySelector('.restaurant-info');
    restaurantInfo.dataset.id = restaurant.id;

    const like = document.querySelector('.favorite');
    if (restaurant.is_favorite === 'true'){
        like.classList.add('favorited');
        like.title = `Remove from favourites`;
    }else{
        like.title = `Add to Favourites`;
    }

    const names = document.querySelectorAll('.restaurant-name');
    names.forEach((name) => {
        name.innerHTML = restaurant.name;
    });


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
    const ul = container.querySelector('#reviews-list');
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
const reviewContainer = document.querySelector('#reviews-container');
const modal = reviewContainer.querySelector('.user-review-modal');
const modalReveal = reviewContainer.querySelector('#review-modal-open');
const modalHide = reviewContainer.querySelector('.review-modal-close');
const reviewForm = reviewContainer.querySelector('#user-review-form');
const submitBtn = reviewForm.querySelector('#form-submit');

// lock focus to modal and listen for close event.
modalHide.addEventListener('keydown', (e) => {
    if (e.keyCode === 9 && reviewForm.classList.contains('visible')) {
        e.preventDefault();
        reviewForm.name.focus();
    } else if (e.keyCode === 13 && reviewForm.classList.contains('visible') ) {
        e.preventDefault();
        modalClose();
    }

});
// Close modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.keyCode === 27 && reviewForm.classList.contains('visible')) {
        modalClose();
    }
});
// trigger modal close
modalHide.addEventListener('click', () => {
    modalClose();
});


// trigger modal open
modalReveal.addEventListener('click', () => {
    modalOpen();
});

/**
 * Actions when modal is opened.
 */
function modalOpen() {
    reviewForm.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    reviewForm.scrollIntoView();
    setTimeout(() => {
        reviewForm.name.focus();
    }, 500);
}

/**
 * Actions when modal is closed.
 */
function modalClose() {
    reviewForm.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    reviewForm.style = '';
    reviewForm.reset();
    submitBtn.innerText = 'Submit Review';
    submitBtn.removeAttribute('disabled');
    modalReveal.focus();
    const confirmation = modal.querySelector('.confirmation');
    if (confirmation) {
        confirmation.remove();
    }

}

/**
 * Actions when modal actions throw an error.
 */
function modalError(err, confirmation) {
    reviewForm.style.visibility = 'hidden';
    console.log('Modal error - ', err);
    confirmation.innerHTML = `<p>Sorry there was an error. Please again try later.</p>`;
    modal.appendChild(confirmation);
    setTimeout(() => {
        modalClose();
    }, 4000)
}

reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.innerText = 'Please Wait';
    submitBtn.setAttribute('disabled', 'disabled');
    const data = {
        restaurant_id: parseInt(getParameterByName('id')),
        name: reviewForm.name.value,
        rating: reviewForm.rating.value,
        comments: reviewForm.comments.value
    };
    const confirmation = document.createElement('div');
    confirmation.classList.add('confirmation');
    confirmation.innerHTML = `<p>Thanks for your review.</p>`;

    if ('serviceWorker' in navigator && 'SyncManager' in window) {

        navigator.serviceWorker.ready
            .then((sw) => {
                data.createdAt = Date.now();

                iDBAddData(data, 'reviews-sync-store')
                    .then(() => {
                        return sw.sync.register('sync-new-review');
                    })
                    .then(() => {
                        modal.appendChild(confirmation);
                        reviewForm.style.visibility = 'hidden';
                        // reviewForm.setAttribute('aria-hidden', 'true');
                        modal.parentElement.parentElement.lastElementChild.appendChild(createReviewHTML(data));

                        setTimeout(() => {
                            modalClose();
                        }, 4000)
                    })

                    .catch((err) => {
                        modalError(err, confirmation);
                    });
            });
    } else {
        fetch('http://localhost:1337/reviews/', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {

                if (data.id) {
                    iDBAddData(data, 'reviews-store')
                        .then(() => {
                            modal.appendChild(confirmation);
                            reviewForm.style.visibility = 'hidden';
                            // reviewForm.setAttribute('aria-hidden', 'true');
                            modal.parentElement.parentElement.lastElementChild.appendChild(createReviewHTML(data));
                            modalHide.focus();
                            setTimeout(() => {
                                modalClose();
                            }, 4000)
                        })
                        .catch((err) => {
                            modalError(err, confirmation);
                        });
                } else {
                    modalError('No data returned', confirmation);
                }
            }).catch((err) => {
            modalError(err, confirmation);
        });
    }

});





