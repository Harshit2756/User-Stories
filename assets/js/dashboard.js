// Dashboard functionality
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the dashboard components
    initializeSearchForm();
    loadRecentBookings();
});

// Initialize search form with city options
function initializeSearchForm() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const dateInput = document.getElementById('date');

    // Set minimum date to today
    const today = new Date();
    dateInput.min = DateUtils.formatDateForInput(today);

    // Set default date to tomorrow
    dateInput.value = DateUtils.formatDateForInput(DateUtils.getTomorrow());

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

    // Add form submission validation
    const form = document.getElementById('dashboard-search-form');
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

        // If valid, submit form
        form.submit();
    });
}

// Load recent bookings from storage
function loadRecentBookings() {
    const bookingsContainer = document.getElementById('recent-bookings');
    const bookings = StorageManager.get('bookings', []);

    // Display loading state for a brief moment to simulate data loading
    setTimeout(() => {
        // Clear loading state
        bookingsContainer.innerHTML = '';

        // Display recent bookings or a message if none
        if (bookings.length === 0) {
            bookingsContainer.innerHTML = `
                <div class="empty-state">
                    <p>You don't have any recent bookings.</p>
                    <a href="train-search.html" class="btn btn-primary">Book Your First Trip</a>
                </div>
            `;
        } else {
            // Show only the 3 most recent bookings
            const recentBookings = bookings.slice(0, 3);

            recentBookings.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'card';

                // Format booking date
                const bookingDate = new Date(booking.date);
                const formattedDate = DateUtils.formatDate(bookingDate);

                // Get train details
                const train = StorageManager.get('trains', []).find(t => t.id === booking.trainId);

                if (train) {
                    card.innerHTML = `
                        <div class="card-header">
                            <h3 class="card-title">${train.name} (${train.number})</h3>
                            <span class="badge badge-success">Confirmed</span>
                        </div>
                        <div class="card-body">
                            <p><strong>From:</strong> ${train.from} <strong>To:</strong> ${train.to}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Class:</strong> ${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</p>
                            <p><strong>Passengers:</strong> ${booking.passengers.length}</p>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="card-header">
                            <h3 class="card-title">Booking #${booking.id.substring(0, 8)}</h3>
                            <span class="badge badge-success">Confirmed</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Class:</strong> ${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</p>
                            <p><strong>Passengers:</strong> ${booking.passengers.length}</p>
                        </div>
                    `;
                }

                bookingsContainer.appendChild(card);
            });
        }
    }, 800); // Simulate loading time
}



// Navigate to search page with pre-filled form
function navigateToSearch(from, to) {
    const tomorrow = DateUtils.formatDateForInput(DateUtils.getTomorrow());

    // Navigate to the search page with query parameters
    window.location.href = `train-search.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${tomorrow}`;
} 