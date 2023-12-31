document.addEventListener('DOMContentLoaded', function () {
    let isSubscriber = 0;
    let subscriptionPrice = 0;
    let subscriptionType = 'N/A';
    fetchAndDisplayTrending();
    fetchAndDisplayRecentlyWatched();
    checkIsSubscriber();

    document.getElementById('movies').addEventListener('click', function () {
        fetchAndDisplayMovies();
    });

    function fetchAndDisplayMovies() {
        fetch('/api/movies/2')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayMovies(data.items);
                    showMoviesSection();
                } else {
                    console.error('Failed to fetch movies:', data.status);
                }
            })
            .catch(error => console.error('Error fetching movies:', error));
    }

    function displayMovies(movies) {
        const movieContainer = document.getElementById('movieContainer');
        movieContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            movieContainer.appendChild(movieCard);
        });
    }

    function checkIsSubscriber() {
    return fetch('/api/subscriber')
        .then(response => response.json())
        .then(data => {
            isSubscriber = data.items;
            return isSubscriber;
        })
        .catch(error => {
            console.error('Error fetching subscription:', error);
            return 0; // Return a default value in case of an error
        });
    }

    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        const videoId = movie.video_id;
        movieCard.innerHTML = `
            <h3>${movie.name}</h3>
            <p>${movie.description}</p>
            <p>Duration: ${movie.duration}</p>
            <a href="#" class="read-reviews" data-movie-id="${videoId}">Reviews</a>
            <a href="#" class="watch-video" watch-video-id="${videoId}">Watch the video</a>
            </br></br>
            <iframe src="${movie.video_link}" width="500px" height="300px" data-video-id="${videoId}"></iframe>
            `;
        const readReviewsLink = movieCard.querySelector('.read-reviews');

        const watchVideoLink = movieCard.querySelector('.watch-video');

        readReviewsLink.addEventListener('click', function (event) {
            event.preventDefault();
            const videoId = this.getAttribute('data-movie-id');

            fetch(`/api/reviews/${videoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Display reviews in a dialog box
                        showReviewsDialog(data.items, videoId);
                    } else {
                        console.error('Failed to fetch reviews:', data.status);
                    }
                })
                .catch(error => console.error('Error fetching reviews:', error));
        });

        watchVideoLink.addEventListener('click', function (event) {
            event.preventDefault();
            const videoId = this.getAttribute('watch-video-id');
            if(!isSubscriber) {
                alert('Please subscribe using subscriptions tab');
            }
            else {
                showVideoDialog(movie);
            }
        });


        return movieCard;
    }

   function showVideoDialog(movie) {
        hideAllSections();
        document.getElementById('moviesContainer').style.display = 'block'
        const movieContainer = document.getElementById('movieContainer');
        movieContainer.innerHTML = '';
        const videoCard = createVideoCard(movie);
        movieContainer.appendChild(videoCard);
   }

   function createVideoCard(movie) {
    const videoCard = document.createElement('div');
    videoCard.classList.add('video-card');
    videoCard.innerHTML = `
        <h3>${movie.name}</h3>
        <p>${movie.description}</p>
        <p>Duration: ${movie.duration}</p>
        <a href="#" class="read-reviews" data-movie-id="${movie.video_id}">Reviews</a>
        </br></br>
        <iframe src="${movie.video_link}" width="100%" height="300px" data-video-id="${movie.video_id}"></iframe>
        `;
        const readReviewsLink = videoCard.querySelector('.read-reviews');
        readReviewsLink.addEventListener('click', function (event) {
            event.preventDefault();
            const videoId = this.getAttribute('data-movie-id');

            fetch(`/api/reviews/${videoId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Display reviews in a dialog box
                        showReviewsDialog(data.items, videoId);
                    } else {
                        console.error('Failed to fetch reviews:', data.status);
                    }
                })
                .catch(error => console.error('Error fetching reviews:', error));
        });
        return videoCard;
   }

   function showReviewsDialog(reviews, videoId) {

    const dialogBox = document.createElement('div');
    dialogBox.classList.add('dialog-box');
    const ratingLabel = document.createElement('label');
    ratingLabel.textContent = '    Rating:';
    const ratingInput = document.createElement('input');
    ratingInput.type = 'range';
    ratingInput.min = 1;
    ratingInput.max = 10;
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', function () {
        dialogBox.remove();
    });
    const newReviewTextarea = document.createElement('textarea');
    newReviewTextarea.placeholder = 'Write your review...';
    const submitReviewButton = document.createElement('button');
    submitReviewButton.textContent = 'Submit Review';
    submitReviewButton.addEventListener('click', function () {
        const newReviewText = newReviewTextarea.value;
        const newRating = ratingInput.value;
        submitReview(videoId, newReviewText,newRating);
        dialogBox.remove();
    });
    const reviewsContainer = document.createElement('div');
    const reviewsItem = document.createElement('h2');
    reviewsItem.textContent = "Review \t \t \t - Rating";
    reviewsContainer.appendChild(reviewsItem);

    reviews.forEach(review => {
        const reviewItem = document.createElement('p');
        reviewItem.textContent = review.comment_string+"  - "+review.rating;
        reviewsContainer.appendChild(reviewItem);
    });
    dialogBox.appendChild(reviewsContainer);
    dialogBox.appendChild(newReviewTextarea);
    dialogBox.appendChild(ratingLabel);
    dialogBox.appendChild(ratingInput);
    dialogBox.appendChild(submitReviewButton);
    dialogBox.appendChild(closeButton);
    document.body.appendChild(dialogBox);
}

function submitReview(videoId, reviewText, rating) {
    const apiUrl = '/api/write-reviews';
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video_id: videoId,
            comment_string: reviewText,
            rating: rating,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'success') {
            console.log('Review submitted successfully:', data);
        } else {
            alert(data.message);
            console.error('Failed to submit review:', data.status);
        }
    })
    .catch(error => console.error('Error submitting review:', error));
}



document.getElementById('categories').addEventListener('click', function () {
        fetchAndDisplayCategories();});

    function fetchAndDisplayCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayCategories(data.items);
                    showCategoriesSection();
                } else {
                    console.error('Failed to fetch categories:', data.status);
                }
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    function displayCategories(categories) {
        const categoriesContainer = document.getElementById('categoriesContainer');
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryItem = createCategoryItem(category);
            categoriesContainer.appendChild(categoryItem);
        });
    }

    function createCategoryItem(category) {
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.innerHTML = `
            <h3>${category.category_name}</h3>
        `;
        categoryItem.addEventListener('click', function () {
            console.log(`Clicked on category: ${category.category_name}, ID: ${category.category_id}`);
            fetchAndDisplayMoviesByCategory(category.category_id);
        });
        return categoryItem;
    }

    function fetchAndDisplayMoviesByCategory(categoryId) {
        fetch(`/api/movies/${categoryId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayMovies(data.items);
                    showMoviesSection();
                } else {
                    console.error('Failed to fetch movies by category:', data.status);
                }
            })
            .catch(error => console.error('Error fetching movies by category:', error));
    }

    function showMoviesSection() {
    hideAllSections();
    document.getElementById('moviesContainer').style.display = 'block';
    }

    function showCategoriesSection() {
     hideAllSections();
     document.getElementById('categoriesContainer').style.display = 'block';
    }

    document.getElementById('genres').addEventListener('click', function () {
        fetchAndDisplayGenres();
    });

    function fetchAndDisplayGenres() {
        fetch('/api/genres')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayGenres(data.items);
                    showGenresSection();
                } else {
                    console.error('Failed to fetch genres:', data.status);
                }
            })
        .catch(error => console.error('Error fetching genres:', error));
    }

    function displayGenres(genres) {
        const genresContainer = document.getElementById('genresContainer');
        genresContainer.innerHTML = '';
        genres.forEach(genre => {
            const genreItem = createGenreItem(genre);
            genresContainer.appendChild(genreItem);
        });
    }

    function createGenreItem(genre) {
        const genreItem = document.createElement('div');
        genreItem.classList.add('genre-item');
        genreItem.innerHTML = `
            <h3>${genre.name}</h3>
        `;
        genreItem.addEventListener('click', function () {
            fetchAndDisplayMoviesByGenre(genre.genre_id);
        });
        return genreItem;
    }

    function fetchAndDisplayMoviesByGenre(genreId) {
        fetch(`/api/movies/genre/${genreId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayMovies(data.items);
                    showMoviesSection();
                } else {
                    console.error('Failed to fetch movies by genre:', data.status);
                }
            })
            .catch(error => console.error('Error fetching movies by genre:', error));
    }

    function showGenresSection() {
        hideAllSections();
        document.getElementById('genresContainer').style.display = 'block';
    }

    document.getElementById('cast').addEventListener('click', function () {
        fetchAndDisplayCast();
    });

    function fetchAndDisplayCast() {
        fetch('/api/cast')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayCast(data.items);
                    showCastSection();
                } else {
                    console.error('Failed to fetch cast:', data.status);
                }
            })
            .catch(error => console.error('Error fetching cast:', error));
    }

    function displayCast(casts) {
        const castContainer = document.getElementById('castContainer');
        castContainer.innerHTML = '';
        casts.forEach(cast => {
            const castItem = createCastItem(cast);
            castContainer.appendChild(castItem);
        });
    }

    function createCastItem(cast) {
        const castItem = document.createElement('div');
        castItem.classList.add('cast-item');
        castItem.innerHTML = `<h3>${cast.actor_name}</h3>`;
        castItem.addEventListener('click', function () {
            fetchAndDisplayMoviesByCast(cast.actor_id);
        });
        return castItem;
    }

    function fetchAndDisplayMoviesByCast(castId) {
        fetch(`/api/movies/cast/${castId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayMovies(data.items);
                    showMoviesSection();
                } else {
                    console.error('Failed to fetch movies by cast:', data.status);
                }
            })
            .catch(error => console.error('Error fetching movies by cast:', error));
    }

    function showCastSection() {
        hideAllSections();
        document.getElementById('castContainer').style.display = 'block';
    }

    document.getElementById('home').addEventListener('click', function () {
        fetchAndDisplayTrending();
        fetchAndDisplayRecentlyWatched();
    });

    function fetchAndDisplayTrending() {
        fetch('/api/trending')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayTrending(data.items);
                    showTrendingSection();
                } else {
                    console.error('Failed to fetch trending:', data.status);
                }
            })
            .catch(error => console.error('Error fetching trending:', error));
    }

    function fetchAndDisplayRecentlyWatched() {
        fetch('/api/recently-watched')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayRecentlyWatched(data.items);
                    showTrendingSection();
                } else {
                    console.error('Failed to fetch trending:', data.status);
                }
            })
            .catch(error => console.error('Error fetching trending:', error));
    }

    function displayTrending(movies) {
        const trendingContainer = document.getElementById('trendingContainer');
        trendingContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            trendingContainer.appendChild(movieCard);
        });
    }

    function displayRecentlyWatched(movies) {
        const watchedContainer = document.getElementById('watchedContainer');
        watchedContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            watchedContainer.appendChild(movieCard);
        });
    }

    function showTrendingSection() {
       hideAllSections();
       document.getElementById('trendingSection').style.display = 'block';
       document.getElementById('recentlyWatchedSection').style.display = 'block';
    }


    function updateViewed(videoId){
       fetch('/api/viewing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({videoId})
        })
        .then(response => response.json())
        .then(data => {
        if (data.status === 'success') {
            console.log('Success:', data);
        } else {
            console.error('Failed :', data.status);
        }}).catch(error => console.error('Error:', error));
    };

    const message = document.getElementById("message");
    window.focus()

    window.addEventListener("blur", () => {
    setTimeout(() => {
    if (document.activeElement.tagName === "IFRAME") {
      const videoId = document.activeElement.getAttribute('data-video-id');
      updateViewed(videoId)
      console.log("clicked");
    }});}, { once: true });


    document.getElementById('logout').addEventListener('click', function () {
        logoutUser();
    });

    function logoutUser() {
        isSubscriber = 0;
        subscriptionPrice =0;
        subscriptionType = 'N/A'
        localStorage.removeItem('authToken');
        window.location.href = '/';
    }

    document.getElementById('viewProfileTab').addEventListener('click', function () {
       fetchAndDisplayProfile();
    });

    function fetchAndDisplayProfile() {
        fetch('/api/profile')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayProfile(data.items[0]);
                    showProfileSection();
                } else {
                   console.error('Failed to fetch profile:', data.status);
                }
            })
            .catch(error => console.error('Error fetching profile:', error));
    }

    function displayProfile(profile) {
        const profileContainer = document.getElementById('profileContainer');
        profileContainer.innerHTML = '';
        profileContainer.appendChild(createProfile(profile));
    }

    function createProfile(profile) {
        const profileItem = document.createElement('div');
        profileItem.classList.add('profile-item');
        let subscriptionType;
        let memberExpiry;
        let since;
        if (profile.expiry !== null) {
        subscriptionType = 'Annual Subscription';
        memberExpiry = profile.expiry
        }
        else if (profile.plan_expiry !== null) {
        subscriptionType = 'Monthly Subscription';
        memberExpiry = profile.plan_expiry
        }
        else {
        subscriptionType = 'No Subscription';
        memberExpiry = 'N/A'
        }

        if(profile.since !==null){
        since = profile.since;
        }
        else{
        since = 'N/A'
        }

        profileItem.innerHTML = `
        <h3>Name: ${profile.name}</h3>
        <p>Age: ${profile.age}</p>
        <p>Gender: ${profile.gender}</p>
        <p>Phone Number: ${profile.phone_no}</p>
        <p>Subscription: ${subscriptionType}</p>
        <p>Plan Expiry: ${memberExpiry}</p>
        <p>Member Since: ${since}</p>`;

    return profileItem;
}

    function showProfileSection() {
        hideAllSections();
        document.getElementById('profilesContainer').style.display = 'block';
    }

    document.getElementById('viewCardsTab').addEventListener('click', function () {
        fetchAndDisplayCards();
    });

    function fetchAndDisplayCards() {
        fetch('/api/cards')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayCards(data.items);
                    showCardsSection();
                } else {
                    console.error('Failed to fetch cards:', data.status);
                }
            })
            .catch(error => console.error('Error fetching cards:', error));
    }

    function displayCards(cards) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = '';
    cards.forEach(card => {
            const cardItem = createCards(card);
            cardContainer.appendChild(cardItem);
        });
    return cards;
    }

    document.getElementById('newCardContainer').addEventListener('click', function (event) {
        handleAddNewCard();
    });

    function handleAddNewCard() {
        hideAllSections();
        document.getElementById('newCardContainer').style.display = 'block'
        document.getElementById('addCardButton').style.display = 'none';
        document.getElementById('newCardForm').style.display = 'block';
    }

    document.getElementById('submitCardDetails').addEventListener('click', function (event) {
        submitCardDetails();
    });

    function submitCardDetails() {
        var cardName = document.getElementById('cardName').value;
        var cardType = document.getElementById('cardType').value;
        var cardNumber = document.getElementById('cardNumber').value;
        var expiryDate = document.getElementById('expiryDate').value;
        var autopay = document.getElementById('autopay').value;
        var formData = {
            cardName: cardName,
            cardType: cardType,
            cardNumber: cardNumber,
            expiryDate: expiryDate,
            autopay: autopay
        };

        fetch('/api/new-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {

            if (data.message === 'success') {
                fetchAndDisplayCards()

            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function createCards(card) {
    const cardItem = document.createElement('div');
    cardItem.classList.add('card-item');
    cardItem.innerHTML = `
    <h3>Name on Card: ${card.name}</h3>
    <p>Card Type: ${card.card_type}</p>
    <p>Card Number: ${card.card_number}</p>
    <p>Expiry Date: ${card.expiry}</p>
    <p>Autopay: ${card.autopay === '1' ? 'Enabled' : 'Disabled'}</p>
    <p>Since: ${card.since}</p>
    <button class="remove-card-btn" data-card-number="${card.card_number}">Remove</button>`;

    cardItem.addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-card-btn')) {
            const cardNumber = event.target.getAttribute('data-card-number');
            removeCard(cardNumber);
        }
    });

    cardItem.addEventListener('click', function () {
        const confirmed = confirm('Do you want to proceed with the payment for this card?');
        if (confirmed) {
            initiatePayment(card.card_number, subscriptionPrice);
            provideSubscription(subscriptionType, subscriptionPrice);
            checkIsSubscriber();
        setTimeout(() => {
            alert('Payment successful. Continue watching!');
        }, 1000);
        }
    });
    return cardItem;
    }

    function showCardsSection() {
        hideAllSections();
        document.getElementById('newCardContainer').style.display = 'block';
        document.getElementById('newCardForm').style.display ='none';
        document.getElementById('cardsContainer').style.display = 'block';
    }


    document.getElementById('viewReviewedItemsTab').addEventListener('click', function () {
       fetchAndDisplayUserReviews();
    });

    function fetchAndDisplayUserReviews() {
        fetch('/api/user-reviews')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayUserReviews(data.items);
                    showUserReviewsSection();
                } else {
                    console.error('Failed to fetch reviews:', data.status);
                }
            })
            .catch(error => console.error('Error fetching reviews:', error));
    }

    function displayUserReviews(reviews) {
    const userReviewContainer = document.getElementById('userReviewContainer');
    userReviewContainer.innerHTML = '';
    reviews.forEach(review => {
            const reviewItem = createUserReviews(review);
            userReviewContainer.appendChild(reviewItem);
        });
    }

    function createUserReviews(review) {
       const reviewItem = document.createElement('div');
       reviewItem.classList.add('userreview-item');
       reviewItem.innerHTML = `<h3>Video: ${review.name}</h3>
       <p>Comment: ${review.comment_string}</p>
       <p>Rating: ${review.rating}</p>`;
       return reviewItem;
    }

    function showUserReviewsSection() {
        hideAllSections();
        document.getElementById('userReviewsContainer').style.display = 'block';
    }

    document.getElementById('viewSubscriptionTab').addEventListener('click', function () {
        performSubscriptionQueryAndDisplay();
    });


    function performSubscriptionQueryAndDisplay() {
    fetch('/api/subscription')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displaySubscriptions(data.items)
                showSubcriptionSection();
                } else {
                    console.error('No subscription data found.');
                }
            })
    };

    function displaySubscriptions(subscriptions) {
    const subscriptionsContainer = document.getElementById('subscriptionsContainer');
    subscriptionsContainer.innerHTML = '';
    subscriptions.forEach(subscription => {
            const subscriptionItem = createSubscription(subscription);
            subscriptionsContainer.appendChild(subscriptionItem);
        })
    }

    function createSubscription(subscription) {
    const subscriptionItem = document.createElement('div');
    subscriptionItem.classList.add('subscription-item');
    subscriptionItem.innerHTML = `
    <h3>Subscription Status: ${subscription.plan_status}</h3>
    <h4>Subscription Type: ${subscription.subscriber}</h4>
    <p>Price: ${subscription.subscription_price}</p>
    <p>Current plan activated on: ${subscription.since_date}</p>
    <p>Next Billing Date: ${subscription.end_date}</p>
    <p>Payment Status: ${subscription.payment_status}</p>
    <p>Amount due: ${subscription.payment_due}</p>
    <p>Paid via: ${subscription.card}</p>`;
    return subscriptionItem;
    }


    function showSubcriptionSection() {
    hideAllSections();
    document.getElementById('subscriptionsContainer').style.display = 'block'
    }

    document.getElementById('favourites').addEventListener('click', function () {
      fetchAndDisplayFavourites();
    });

    function fetchAndDisplayFavourites() {
        fetch('/api/favourites')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayFavourites(data.items);
                    showFavouritesSection();
                } else {
                    console.error('Failed to fetch favourites:', data.status);
                }
            })
            .catch(error => console.error('Error fetching favourites:', error));
    }

    function displayFavourites(movies) {
    const favouritesContainer = document.getElementById('favouritesContainer');
    favouritesContainer.innerHTML = '';
    movies.forEach(movie => {
            const favItem = createMovieCard(movie);
            favouritesContainer.appendChild(favItem);
        });
    }

    function showFavouritesSection() {
        hideAllSections();
        document.getElementById('favouritesContainer').style.display = 'block';
    }


    function removeCard(cardNumber) {
    fetch(`/api/cards/${cardNumber}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
    if (data.message === 'success') {
        fetchAndDisplayCards();
    }
    else {
        console.error('Failed to remove card:', data.status);
    }
    }).catch(error => console.error('Error removing card:', error));
    }

    function showPrices() {
        var selectedPlan = document.getElementById('subscriptionPlan').value;
        var selectedDuration = document.getElementById('subscriptionDuration').value;
        if (selectedPlan && selectedDuration) {
            displayPrices(selectedPlan, selectedDuration);
            document.getElementById('priceDisplay').style.display = 'block';
            document.getElementById('proceedToPayment').style.display = 'block';
        } else {
            alert('Please select both plan and duration before showing prices.');
        }
    }

    function initiatePayment(cardId, price) {
    alert('Initiating payment for card with number ' + cardId+ ' for $'+price);
    }

    function displayPrices(plan, duration) {
    let price = 0;

        if(plan === 'basic' && duration === 'Monthly'){
               price = 10;
        }
        else if(plan === 'basic' && duration === 'Annual'){
               price = 100;
        }
        else if(plan === 'standard' && duration === 'Monthly'){
               price = 15;
        }
        else if(plan === 'standard' && duration === 'Annual'){
               price = 150;
        }
        else if(plan === 'premium' && duration === 'Monthly'){
               price = 25;
        }
        else if(plan === 'premium' && duration === 'Annual'){
               price = 250;
        }

        document.getElementById('priceDisplay').innerHTML = 'Price: $' + price.toFixed(2);
        subscriptionPrice = price;
        subscriptionType = duration;
        return price;
    }

    document.getElementById('showPrices').addEventListener('click', function () {
        showPrices();
    });

    document.getElementById('manageSubscriptionTab').addEventListener('click', function () {
        displayPlans();
    });

    document.getElementById('proceedToPayment').addEventListener('click', function () {
        fetchAndDisplayCards();
    });


    function displayPlans() {
       hideAllSections();
       document.getElementById('ManageSubscriptionContainer').style.display = 'block';
       document.getElementById('plan').style.display = 'block';
       document.getElementById('duration').style.display = 'block';
       document.getElementById('showPrices').style.display = 'block';
       document.getElementById('proceedToPayment').style.display = 'none';
    }

    document.getElementById('recommendations').addEventListener('click', function () {
        fetchAndDisplayRecommendations();
    });

    function fetchAndDisplayRecommendations() {
        fetch('/api/recommendations')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    displayMovies(data.items);
                    showMoviesSection();
                } else {
                    console.error('Failed to fetch recommendations:', data.status);
                }
            })
            .catch(error => console.error('Error fetching recommendations:', error));
    }

    function provideSubscription(type, price) {
    fetch('/api/user-subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: type,
            price: price
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'success') {
            console.log('Subscribed', data);
        } else {
            alert(data.message);
            console.error('Failed to submit review:', data.status);
        }
    })
    .catch(error => console.error('Error submitting review:', error));
    }

    function hideAllSections(){
        document.getElementById('moviesContainer').style.display = 'none'
        document.getElementById('trendingSection').style.display = 'none';
        document.getElementById('recentlyWatchedSection').style.display = 'none';
        document.getElementById('categoriesContainer').style.display = 'none';
        document.getElementById('genresContainer').style.display = 'none';
        document.getElementById('castContainer').style.display = 'none';
        document.getElementById('profilesContainer').style.display = 'none';
        document.getElementById('cardsContainer').style.display = 'none';
        document.getElementById('userReviewsContainer').style.display = 'none';
        document.getElementById('favouritesContainer').style.display = 'none';
        document.getElementById('newCardContainer').style.display = 'none';
        document.getElementById('subscriptionsContainer').style.display = 'none';
        document.getElementById('ManageSubscriptionContainer').style.display = 'none';
        document.getElementById('priceDisplay').style.display = 'none';
    }
});
