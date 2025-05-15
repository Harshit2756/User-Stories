// Booking History functionality
document.addEventListener('DOMContentLoaded', function () {

    // Load bookings from storage
    loadBookings();

    // Set up search and filters
    setupSearchAndFilters();

    // Set up modal
    setupBookingModal();
});


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
                            <strong>${passenger.idType === 'aadharCard' ? 'aadhar card' : passenger.idType === 'drivingLicense' ? 'Driving License' : 'Passport'}</strong>
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
                <div class="booking-actions">
                    <button class="btn btn-primary" id="print-booking"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-secondary modal-close-btn">Close</button>
                </div>
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
                <div class="booking-actions">
                    <button class="btn btn-primary" id="print-booking"><i class="fas fa-print"></i> Print</button>
                    <button class="btn btn-secondary modal-close-btn">Close</button>
                </div>
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

    const printBtn = document.getElementById('print-booking');
    if (printBtn) {
        printBtn.addEventListener('click', function () {
            printBookingDetails();
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

// Print booking details
function printBookingDetails() {
    const modalContent = document.getElementById('booking-details').innerHTML;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Booking Details - TrainConnect</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    color: #333;
                }
                .booking-detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .badge {
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    color: white;
                }
                .badge-confirmed { background-color: #28a745; }
                .badge-completed { background-color: #007bff; }
                .badge-cancelled { background-color: #dc3545; }
                .booking-detail-section {
                    margin-bottom: 25px;
                }
                .booking-detail-section h3 {
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #eee;
                }
                .journey-details, .ticket-details, .passenger-item {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                }
                .booking-detail-footer, .booking-actions {
                    display: none;
                }
                @media print {
                    .booking-actions {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div id="printable-content">
                <h1 style="text-align: center; margin-bottom: 30px;">TrainConnect Booking Details</h1>
                ${modalContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function(){
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
