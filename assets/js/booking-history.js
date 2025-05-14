// Booking History functionality
document.addEventListener('DOMContentLoaded', function () {
    // Add CSS styles
    addBookingHistoryStyles();

    // Initialize booking history
    initializeBookingHistory();
});

// Initialize booking history page
function initializeBookingHistory() {
    // Load bookings from storage
    loadBookings();

    // Set up search and filters
    setupSearchAndFilters();

    // Set up modal
    setupBookingModal();
}

// Load bookings from storage and display them
function loadBookings(filters = {}) {
    const bookingsContainer = document.getElementById('bookings-list');
    const noBookingsContainer = document.getElementById('no-bookings');
    const bookingCountContainer = document.getElementById('booking-count');

    // Get bookings from storage
    let bookings = StorageManager.get('bookings', []);

    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply filters if any
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        bookings = bookings.filter(booking => {
            // Search in train name, from/to locations, booking ID
            const train = StorageManager.get('trains', []).find(t => t.id === booking.trainId);
            if (!train) return false;

            return (
                train.name.toLowerCase().includes(searchTerm) ||
                train.number.toLowerCase().includes(searchTerm) ||
                train.from.toLowerCase().includes(searchTerm) ||
                train.to.toLowerCase().includes(searchTerm) ||
                booking.id.toLowerCase().includes(searchTerm)
            );
        });
    }

    if (filters.date) {
        const filterDate = new Date(filters.date);
        filterDate.setHours(0, 0, 0, 0);

        bookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            bookingDate.setHours(0, 0, 0, 0);
            return bookingDate.getTime() === filterDate.getTime();
        });
    }

    if (filters.train) {
        bookings = bookings.filter(booking => booking.trainId === filters.train);
    }

    if (filters.status) {
        bookings = bookings.filter(booking => booking.status === filters.status);
    }

    // Update booking count
    bookingCountContainer.textContent = `${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'} found`;

    // Display loading state for a brief moment to simulate data loading
    setTimeout(() => {
        // Clear loading state
        bookingsContainer.innerHTML = '';

        // Display bookings or a message if none
        if (bookings.length === 0) {
            bookingsContainer.style.display = 'none';
            noBookingsContainer.style.display = 'block';
        } else {
            bookingsContainer.style.display = 'grid';
            noBookingsContainer.style.display = 'none';

            bookings.forEach(booking => {
                const bookingCard = createBookingCard(booking);
                bookingsContainer.appendChild(bookingCard);
            });
        }
    }, 800); // Simulate loading time
}

// Create a booking card element
function createBookingCard(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card';

    // Get train details
    const trains = StorageManager.get('trains', []);
    const train = trains.find(t => t.id === booking.trainId);

    if (!train) {
        // Train not found, create a simplified card
        card.innerHTML = `
            <div class="booking-card-header">
                <h3>Booking #${booking.id.substring(0, 8).toUpperCase()}</h3>
                <span class="badge badge-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-card-body">
                <p><strong>Date:</strong> ${DateUtils.formatDate(booking.date)}</p>
                <p><strong>Passengers:</strong> ${booking.passengers.length}</p>
                <p><strong>Class:</strong> ${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</p>
                <p><strong>Price:</strong> $${booking.totalPrice}</p>
            </div>
            <div class="booking-card-footer">
                <button class="btn btn-secondary view-details-btn" data-booking-id="${booking.id}">View Details</button>
            </div>
        `;
    } else {
        // Format date for display
        const formattedDate = DateUtils.formatDate(booking.date);

        card.innerHTML = `
            <div class="booking-card-header">
                <h3>${train.name} (${train.number})</h3>
                <span class="badge badge-${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-card-body">
                <div class="booking-route">
                    <div class="route-from">${train.from}</div>
                    <div class="route-arrow"><i class="fas fa-long-arrow-alt-right"></i></div>
                    <div class="route-to">${train.to}</div>
                </div>
                <div class="booking-details">
                    <div class="booking-detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="booking-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${train.departureTime}</span>
                    </div>
                    <div class="booking-detail-item">
                        <i class="fas fa-users"></i>
                        <span>${booking.passengers.length} ${booking.passengers.length === 1 ? 'passenger' : 'passengers'}</span>
                    </div>
                    <div class="booking-detail-item">
                        <i class="fas fa-ticket-alt"></i>
                        <span>${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</span>
                    </div>
                </div>
                <div class="booking-price">
                    <span>Total:</span>
                    <strong>$${booking.totalPrice}</strong>
                </div>
            </div>
            <div class="booking-card-footer">
                <button class="btn btn-secondary view-details-btn" data-booking-id="${booking.id}">View Details</button>
                ${booking.status === 'confirmed' ? `<button class="btn btn-danger cancel-booking-btn" data-booking-id="${booking.id}">Cancel</button>` : ''}
            </div>
        `;
    }

    return card;
}

// Set up search and filters functionality
function setupSearchAndFilters() {
    const searchInput = document.getElementById('booking-search');
    const searchBtn = document.getElementById('search-btn');
    const dateFilter = document.getElementById('filter-date');
    const trainFilter = document.getElementById('filter-train');
    const statusFilter = document.getElementById('filter-status');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Populate train filter
    const trains = StorageManager.get('trains', []);
    trains.forEach(train => {
        const option = document.createElement('option');
        option.value = train.id;
        option.textContent = `${train.name} (${train.number})`;
        trainFilter.appendChild(option);
    });

    // Search button click handler
    searchBtn.addEventListener('click', function () {
        applyFilters();
    });

    // Search input enter key handler
    searchInput.addEventListener('keyup', function (e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Filter change handlers
    dateFilter.addEventListener('change', applyFilters);
    trainFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Reset filters button click handler
    resetFiltersBtn.addEventListener('click', function () {
        searchInput.value = '';
        dateFilter.value = '';
        trainFilter.value = '';
        statusFilter.value = '';

        applyFilters();
    });

    // Apply filters function
    function applyFilters() {
        const filters = {
            search: searchInput.value.trim(),
            date: dateFilter.value,
            train: trainFilter.value,
            status: statusFilter.value
        };

        loadBookings(filters);
    }
}

// Set up booking details modal
function setupBookingModal() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.querySelector('.modal-close');

    // Close modal when clicking the close button
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add event delegation for view details buttons
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
            const button = e.target.classList.contains('view-details-btn') ? e.target : e.target.closest('.view-details-btn');
            const bookingId = button.dataset.bookingId;
            showBookingDetails(bookingId);
        } else if (e.target.classList.contains('cancel-booking-btn') || e.target.closest('.cancel-booking-btn')) {
            const button = e.target.classList.contains('cancel-booking-btn') ? e.target : e.target.closest('.cancel-booking-btn');
            const bookingId = button.dataset.bookingId;
            cancelBooking(bookingId);
        }
    });
}

// Show booking details in modal
function showBookingDetails(bookingId) {
    const modal = document.getElementById('booking-modal');
    const bookingDetails = document.getElementById('booking-details');

    // Get booking data
    const bookings = StorageManager.get('bookings', []);
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
        bookingDetails.innerHTML = `<p>Booking not found.</p>`;
        modal.style.display = 'block';
        return;
    }

    // Get train data
    const trains = StorageManager.get('trains', []);
    const train = trains.find(t => t.id === booking.trainId);

    let html = '';

    if (train) {
        // Format date for display
        const formattedDate = DateUtils.formatDate(booking.date);

        html = `
            <div class="booking-detail-header">
                <div class="booking-ref">
                    <span>Booking Reference:</span>
                    <strong>#${booking.id.substring(0, 8).toUpperCase()}</strong>
                </div>
                <div class="booking-status">
                    <span class="badge badge-${booking.status}">${booking.status}</span>
                </div>
            </div>
            
            <div class="booking-detail-section">
                <h3>Journey Details</h3>
                <div class="journey-details">
                    <div class="train-info">
                        <div class="train-name">${train.name} (${train.number})</div>
                        <div class="train-date">${formattedDate}</div>
                    </div>
                    <div class="journey-route">
                        <div class="station-details">
                            <div class="station-time">${train.departureTime}</div>
                            <div class="station-name">${train.from}</div>
                        </div>
                        <div class="journey-duration">
                            <div class="duration-line"></div>
                            <div class="duration-time">${train.duration}</div>
                        </div>
                        <div class="station-details">
                            <div class="station-time">${train.arrivalTime}</div>
                            <div class="station-name">${train.to}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="booking-detail-section">
                <h3>Ticket Details</h3>
                <div class="ticket-details">
                    <div class="ticket-class">
                        <span>Travel Class:</span>
                        <strong>${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</strong>
                    </div>
                    <div class="ticket-price">
                        <span>Price per ticket:</span>
                        <strong>$${train.price[booking.seatClass]}</strong>
                    </div>
                    <div class="ticket-total">
                        <span>Total amount:</span>
                        <strong>$${booking.totalPrice}</strong>
                    </div>
                </div>
            </div>
            
            <div class="booking-detail-section">
                <h3>Passenger Details</h3>
                <div class="passenger-list">
        `;

        booking.passengers.forEach((passenger, index) => {
            html += `
                <div class="passenger-item">
                    <div class="passenger-header">
                        <h4>Passenger ${index + 1}</h4>
                    </div>
                    <div class="passenger-info">
                        <div class="passenger-info-item">
                            <span>Name:</span>
                            <strong>${passenger.name}</strong>
                        </div>
                        <div class="passenger-info-item">
                            <span>Age:</span>
                            <strong>${passenger.age}</strong>
                        </div>
                        <div class="passenger-info-item">
                            <span>Gender:</span>
                            <strong>${passenger.gender.charAt(0).toUpperCase() + passenger.gender.slice(1)}</strong>
                        </div>
                        <div class="passenger-info-item">
                            <span>ID Type:</span>
                            <strong>${passenger.idType === 'nationalId' ? 'National ID' : passenger.idType === 'drivingLicense' ? 'Driving License' : 'Passport'}</strong>
                        </div>
                        <div class="passenger-info-item">
                            <span>ID Number:</span>
                            <strong>${passenger.idNumber}</strong>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            
            <div class="booking-detail-section">
                <h3>Contact Information</h3>
                <div class="contact-info">
                    <div class="contact-info-item">
                        <i class="fas fa-envelope"></i>
                        <span>${booking.contactInfo.email}</span>
                    </div>
                    <div class="contact-info-item">
                        <i class="fas fa-phone"></i>
                        <span>${booking.contactInfo.phone}</span>
                    </div>
                </div>
            </div>
            
            <div class="booking-detail-footer">
                ${booking.status === 'confirmed' ? `<button class="btn btn-danger" id="modal-cancel-booking" data-booking-id="${booking.id}">Cancel Booking</button>` : ''}
                <button class="btn btn-secondary modal-close-btn">Close</button>
            </div>
        `;
    } else {
        // Simplified details if train not found
        html = `
            <div class="booking-detail-header">
                <div class="booking-ref">
                    <span>Booking Reference:</span>
                    <strong>#${booking.id.substring(0, 8).toUpperCase()}</strong>
                </div>
                <div class="booking-status">
                    <span class="badge badge-${booking.status}">${booking.status}</span>
                </div>
            </div>
            
            <div class="booking-detail-section">
                <h3>Journey Details</h3>
                <p>Date: ${DateUtils.formatDate(booking.date)}</p>
            </div>
            
            <div class="booking-detail-section">
                <h3>Ticket Details</h3>
                <div class="ticket-details">
                    <div class="ticket-class">
                        <span>Travel Class:</span>
                        <strong>${booking.seatClass.charAt(0).toUpperCase() + booking.seatClass.slice(1)}</strong>
                    </div>
                    <div class="ticket-total">
                        <span>Total amount:</span>
                        <strong>$${booking.totalPrice}</strong>
                    </div>
                </div>
            </div>
            
            <div class="booking-detail-footer">
                ${booking.status === 'confirmed' ? `<button class="btn btn-danger" id="modal-cancel-booking" data-booking-id="${booking.id}">Cancel Booking</button>` : ''}
                <button class="btn btn-secondary modal-close-btn">Close</button>
            </div>
        `;
    }

    bookingDetails.innerHTML = html;

    // Add event listeners to modal buttons
    const cancelBtn = document.getElementById('modal-cancel-booking');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            const bookingId = this.dataset.bookingId;
            cancelBooking(bookingId);
            modal.style.display = 'none';
        });
    }

    const closeModalBtn = document.querySelector('.modal-close-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    // Show the modal
    modal.style.display = 'block';
}

// Cancel a booking
function cancelBooking(bookingId) {
    // Confirm cancellation
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        return;
    }

    // Get bookings from storage
    const bookings = StorageManager.get('bookings', []);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
        Toast.error('Booking not found.');
        return;
    }

    // Get the booking
    const booking = bookings[bookingIndex];

    // Update booking status
    booking.status = 'cancelled';

    // Update storage
    StorageManager.set('bookings', bookings);

    // Restore seat availability
    const trains = StorageManager.get('trains', []);
    const trainIndex = trains.findIndex(t => t.id === booking.trainId);

    if (trainIndex !== -1) {
        trains[trainIndex].availability[booking.seatClass] += booking.passengers.length;
        StorageManager.set('trains', trains);
    }

    // Show success message
    Toast.success('Booking cancelled successfully.');

    // Reload bookings
    loadBookings();
}

// Add styles for booking history page
function addBookingHistoryStyles() {
    const styles = `
        .filter-container {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .search-box {
            display: flex;
            margin-bottom: 20px;
        }
        
        .search-box input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px 0 0 4px;
            font-size: 16px;
        }
        
        .search-box button {
            border-radius: 0 4px 4px 0;
        }
        
        .filter-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: flex-end;
        }
        
        .filter-item {
            flex: 1;
            min-width: 200px;
        }
        
        .filter-item label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .filter-item select, .filter-item input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .booking-count {
            margin-bottom: 20px;
            font-size: 16px;
            color: #666;
        }
        
        .bookings-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .booking-card {
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .booking-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .booking-card-header {
            padding: 15px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .booking-card-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .badge-confirmed {
            background-color: #28a745;
            color: #fff;
        }
        
        .badge-completed {
            background-color: #007bff;
            color: #fff;
        }
        
        .badge-cancelled {
            background-color: #dc3545;
            color: #fff;
        }
        
        .booking-card-body {
            padding: 15px;
        }
        
        .booking-route {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .route-from, .route-to {
            font-weight: 500;
        }
        
        .route-arrow {
            color: #007bff;
        }
        
        .booking-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .booking-detail-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
        }
        
        .booking-detail-item i {
            color: #007bff;
        }
        
        .booking-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .booking-price strong {
            font-size: 18px;
            color: #007bff;
        }
        
        .booking-card-footer {
            padding: 15px;
            background-color: #f8f9fa;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px 0;
        }
        
        .empty-state i {
            font-size: 48px;
            color: #ccc;
            margin-bottom: 20px;
        }
        
        .empty-state h3 {
            margin-bottom: 10px;
        }
        
        .empty-state p {
            margin-bottom: 20px;
            color: #666;
        }
        
        /* Modal Styles */
        .booking-detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .booking-ref strong {
            font-size: 16px;
        }
        
        .booking-detail-section {
            margin-bottom: 25px;
        }
        
        .booking-detail-section h3 {
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }
        
        .journey-details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        
        .train-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .train-name {
            font-weight: 600;
        }
        
        .journey-route {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .station-time {
            font-weight: 600;
            font-size: 16px;
        }
        
        .journey-duration {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 20px;
        }
        
        .duration-line {
            width: 100%;
            height: 2px;
            background-color: #007bff;
            position: relative;
        }
        
        .duration-time {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .passenger-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .passenger-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        
        .passenger-header {
            margin-bottom: 10px;
        }
        
        .passenger-info {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .passenger-info-item {
            display: flex;
            flex-direction: column;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .contact-info-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .contact-info-item i {
            color: #007bff;
        }
        
        .booking-detail-footer {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .ticket-details {
            display: flex;
            flex-direction: column;
            gap: 10px;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        
        .ticket-class, .ticket-price, .ticket-total {
            display: flex;
            justify-content: space-between;
        }
        
        .ticket-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            font-size: 18px;
        }
        
        @media (max-width: 768px) {
            .bookings-list {
                grid-template-columns: 1fr;
            }
            
            .filter-controls {
                flex-direction: column;
            }
            
            .filter-item {
                width: 100%;
            }
            
            .journey-route {
                flex-direction: column;
                gap: 15px;
            }
            
            .journey-duration {
                width: 100%;
                flex-direction: row;
            }
            
            .duration-line {
                height: 100%;
                width: 2px;
            }
            
            .duration-time {
                margin-top: 0;
                margin-left: 10px;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
} 