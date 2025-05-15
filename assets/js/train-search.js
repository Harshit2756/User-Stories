// Train Search and Availability functionality
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the train search form
    initializeSearchForm();

    // Check for URL parameters and auto-submit search if present
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    const toParam = urlParams.get('to');
    const dateParam = urlParams.get('date');

    if (fromParam && toParam && dateParam) {
        // Set form values
        document.getElementById('from').value = fromParam;
        document.getElementById('to').value = toParam;
        document.getElementById('date').value = dateParam;

        // Perform search
        performSearch(fromParam, toParam, dateParam);
    }

    // Add reset button functionality
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', function () {
        // Reset the date input to today's date
        const dateInput = document.getElementById('date');

        // Clear search results and show initial message
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = `
            <div class="initial-message">
                <p>Enter your travel details above to search for trains</p>
            </div>
        `;

        // Clear URL parameters
        window.history.pushState({}, '', window.location.pathname);
    });


});

// Initialize search form with city options
function initializeSearchForm() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const dateInput = document.getElementById('date');

    // Set minimum date to today
    const today = new Date();
    dateInput.min = DateUtils.formatDateForInput(today);

    // Set default date to tomorrow if not already set
    if (!dateInput.value) {
        dateInput.value = DateUtils.formatDateForInput(DateUtils.getTomorrow());
    }

    // Get cities from storage
    const cities = StorageManager.get('cities', []);

    // Populate city dropdowns
    cities.forEach(city => {
        const fromOption = document.createElement('option');
        fromOption.value = city;
        fromOption.textContent = city;
        fromSelect.appendChild(fromOption);

        const toOption = document.createElement('option');
        toOption.value = city;
        toOption.textContent = city;
        toSelect.appendChild(toOption);
    });

    // Add form submission handling
    const form = document.getElementById('train-search-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const rules = {
            from: {
                required: true,
                requiredMessage: 'Please select an origin city'
            },
            to: {
                required: true,
                requiredMessage: 'Please select a destination city',
                custom: function (value) {
                    return value !== fromSelect.value;
                },
                customMessage: 'Origin and destination cannot be the same'
            },
            date: {
                required: true,
                requiredMessage: 'Please select a travel date'
            }
        };

        const validation = FormValidator.validate(form, rules);

        if (!validation.isValid) {
            FormValidator.showErrors(form, validation.errors);
            return;
        }

        // If valid, perform search
        performSearch(
            fromSelect.value,
            toSelect.value,
            dateInput.value
        );
    });
}

// Perform train search and display results
function performSearch(from, to, date) {
    const searchResults = document.getElementById('search-results');

    // Show loading state
    searchResults.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching for trains...</p>
        </div>
    `;

    // Get trains from storage
    let allTrains = StorageManager.get('trains', []);

    // Simulate API delay
    setTimeout(() => {
        // Filter trains based on search criteria
        const filteredTrains = allTrains.filter(train => {
            return (train.from === from && train.to === to);
        });

        // Display results
        if (filteredTrains.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No trains found for your search criteria.</p>
                    <p>Try different dates or destinations.</p>
                </div>
            `;
        } else {
            // Update URL with search parameters without refreshing the page
            const url = new URL(window.location);
            url.searchParams.set('from', from);
            url.searchParams.set('to', to);
            url.searchParams.set('date', date);
            window.history.pushState({}, '', url);

            // Format date for display
            const formattedDate = DateUtils.formatDate(date);

            // Create results container
            searchResults.innerHTML = `
                <div class="results-header">
                    <h2>Search Results</h2>
                    <p><strong>${filteredTrains.length}</strong> trains found from <strong>${from}</strong> to <strong>${to}</strong> on <strong>${formattedDate}</strong></p>
                </div>
                <div class="train-list" id="train-list"></div>
            `;

            const trainList = document.getElementById('train-list');

            // Generate HTML for each train
            filteredTrains.forEach(train => {
                const trainCard = document.createElement('div');
                trainCard.className = 'train-card';

                trainCard.innerHTML = `
                    <div class="train-card-header">
                        <div class="train-name">${train.name} (${train.number})</div>
                        <div class="train-actions">
                            <button class="btn-details" data-train-id="${train.id}">View Details</button>
                        </div>
                    </div>
                    <div class="train-card-body">
                        <div class="train-details">
                            <div class="train-time">
                                <h3>Departure</h3>
                                <p>${train.departureTime}</p>
                                <small>${from}</small>
                            </div>
                            <div class="train-duration">
                                <h3>Duration</h3>
                                <p>${train.duration}</p>
                                <div class="train-line">
                                    <div class="train-dot"></div>
                                    <div class="train-dot-line"></div>
                                    <div class="train-dot"></div>
                                </div>
                            </div>
                            <div class="train-time">
                                <h3>Arrival</h3>
                                <p>${train.arrivalTime}</p>
                                <small>${to}</small>
                            </div>
                            <div class="train-price">
                                <h3>Starting From</h3>
                                <p>$${train.price.economy}</p>
                            </div>
                        </div>
                        <div class="seat-availability">
                            <h3>Seat Availability</h3>
                            <div class="seat-types">
                                <div class="seat-type">
                                    <h4>Economy</h4>
                                    <p class="${getSeatAvailabilityClass(train.availability.economy)}">
                                        ${getSeatAvailabilityText(train.availability.economy)}
                                    </p>
                                </div>
                                <div class="seat-type">
                                    <h4>Business</h4>
                                    <p class="${getSeatAvailabilityClass(train.availability.business)}">
                                        ${getSeatAvailabilityText(train.availability.business)}
                                    </p>
                                </div>
                                <div class="seat-type">
                                    <h4>First Class</h4>
                                    <p class="${getSeatAvailabilityClass(train.availability.firstClass)}">
                                        ${getSeatAvailabilityText(train.availability.firstClass)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="train-card-footer">
                        <div class="train-info">
                            <i class="fas fa-info-circle"></i> 
                            <span>Click "View Details" for more information</span>
                        </div>
                        <button class="btn btn-primary book-btn" data-train-id="${train.id}" data-trip-date="${date}">Book Now</button>
                    </div>
                `;

                trainList.appendChild(trainCard);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.btn-details').forEach(button => {
                button.addEventListener('click', function () {
                    const trainId = this.getAttribute('data-train-id');
                    showTrainDetails(trainId);
                });
            });

            document.querySelectorAll('.book-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const trainId = this.getAttribute('data-train-id');
                    const tripDate = this.getAttribute('data-trip-date');
                    navigateToBooking(trainId, tripDate);
                });
            });

        }
    }, 1000); // Simulate network delay
}

// Helper function to determine seat availability class
function getSeatAvailabilityClass(seats) {
    if (seats === 0) return 'seat-unavailable';
    if (seats < 20) return 'seat-limited';
    return 'seat-available';
}

// Helper function to determine seat availability text
function getSeatAvailabilityText(seats) {
    if (seats === 0) return 'Not Available';
    if (seats < 20) return 'Limited Seats';
    return 'Available';
}

// Show train details in modal
function showTrainDetails(trainId) {
    const trains = StorageManager.get('trains', []);
    const train = trains.find(t => t.id === trainId);

    if (!train) return;

    const modal = document.getElementById('train-modal');
    const modalTrainName = document.getElementById('modal-train-name');
    const modalTrainDetails = document.getElementById('modal-train-details');

    modalTrainName.textContent = `${train.name} (${train.number})`;

    // Calculate seat availability percentages
    const economyPercentage = Math.min(100, (train.availability.economy / 150) * 100);
    const businessPercentage = Math.min(100, (train.availability.business / 60) * 100);
    const firstClassPercentage = Math.min(100, (train.availability.firstClass / 30) * 100);

    modalTrainDetails.innerHTML = `
        <div class="train-modal-info">
            <div class="train-route">
                <div class="train-station">
                    <h3>${train.from}</h3>
                    <p>${train.departureTime}</p>
                </div>
                <div class="train-journey-line">
                    <div class="journey-line"></div>
                    <div class="journey-duration">${train.duration}</div>
                </div>
                <div class="train-station">
                    <h3>${train.to}</h3>
                    <p>${train.arrivalTime}</p>
                </div>
            </div>
            
            <div class="train-features">
                <h3>Train Features</h3>
                <ul class="feature-list">
                    <li><i class="fas fa-wifi"></i> Free WiFi</li>
                    <li><i class="fas fa-utensils"></i> Catering</li>
                    <li><i class="fas fa-plug"></i> Power Outlets</li>
                    <li><i class="fas fa-wheelchair"></i> Accessible</li>
                </ul>
            </div>
            
            <div class="train-classes">
                <h3>Classes & Pricing</h3>
                <div class="class-details">
                    <div class="class-item">
                        <div class="class-info">
                            <h4>Economy</h4>
                            <p class="class-price">$${train.price.economy}</p>
                        </div>
                        <div class="class-availability">
                            <div class="availability-bar">
                                <div class="availability-fill" style="width: ${economyPercentage}%"></div>
                            </div>
                            <p class="${getSeatAvailabilityClass(train.availability.economy)}">
                                ${train.availability.economy} seats ${getSeatAvailabilityText(train.availability.economy).toLowerCase()}
                            </p>
                        </div>
                    </div>
                    
                    <div class="class-item">
                        <div class="class-info">
                            <h4>Business</h4>
                            <p class="class-price">$${train.price.business}</p>
                        </div>
                        <div class="class-availability">
                            <div class="availability-bar">
                                <div class="availability-fill" style="width: ${businessPercentage}%"></div>
                            </div>
                            <p class="${getSeatAvailabilityClass(train.availability.business)}">
                                ${train.availability.business} seats ${getSeatAvailabilityText(train.availability.business).toLowerCase()}
                            </p>
                        </div>
                    </div>
                    
                    <div class="class-item">
                        <div class="class-info">
                            <h4>First Class</h4>
                            <p class="class-price">$${train.price.firstClass}</p>
                        </div>
                        <div class="class-availability">
                            <div class="availability-bar">
                                <div class="availability-fill" style="width: ${firstClassPercentage}%"></div>
                            </div>
                            <p class="${getSeatAvailabilityClass(train.availability.firstClass)}">
                                ${train.availability.firstClass} seats ${getSeatAvailabilityText(train.availability.firstClass).toLowerCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="train-modal-actions">
                <button class="btn btn-primary modal-book-btn" data-train-id="${train.id}">Book This Train</button>
            </div>
        </div>
    `;

    // Show the modal
    modal.style.display = 'block';

    // Add event listener to close button
    const closeBtn = document.querySelector('.modal-close');
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Add event listener to book button
    const bookBtn = document.querySelector('.modal-book-btn');
    bookBtn.addEventListener('click', function () {
        const trainId = this.getAttribute('data-train-id');
        // Get date from the search form
        const date = document.getElementById('date').value;
        navigateToBooking(trainId, date);
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Navigate to booking page
function navigateToBooking(trainId, date) {
    window.location.href = `booking.html?train=${trainId}&date=${date}`;
}


