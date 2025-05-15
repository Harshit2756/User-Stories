// Booking functionality
document.addEventListener('DOMContentLoaded', function () {

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const trainId = urlParams.get('train');
    const tripDate = urlParams.get('date');

    // Check if train ID is provided
    if (!trainId || !tripDate) {
        // Show error message if train ID is missing
        document.getElementById('booking-error').style.display = 'block';
        document.getElementById('booking-content').style.display = 'none';
        return;
    }

    // Get train data from storage
    const trains = StorageManager.get('trains', []);
    const selectedTrain = trains.find(train => train.id === trainId);

    if (!selectedTrain) {
        // Show error message if train not found
        document.getElementById('booking-error').style.display = 'block';
        document.getElementById('booking-content').style.display = 'none';
        return;
    }

    // Initialize booking state
    const bookingState = {
        trainId,
        date: tripDate,
        train: selectedTrain,
        seatClass: null,
        passengers: [],
        contactInfo: {
            email: '',
            phone: ''
        },
        paymentMethod: 'card',
        totalPrice: 0
    };

    // Display train details
    displayTrainDetails(selectedTrain, tripDate);

    // Set up seat class selection
    setupSeatClassSelection(selectedTrain, bookingState);

    // Set up navigation between steps
    setupStepNavigation(bookingState);

    // Set up passenger form
    setupPassengerForm(bookingState);

    // Set up payment form
    setupPaymentForm(bookingState);
});

// Display train details in the booking form
function displayTrainDetails(train, date) {
    const trainDetailsContainer = document.getElementById('train-details');

    // Format date for display
    const formattedDate = DateUtils.formatDate(date);

    // Create train details HTML
    const html = `
        <div class="selected-train">
            <div class="train-header">
                <h3>${train.name} (${train.number})</h3>
                <span class="train-date">${formattedDate}</span>
            </div>
            <div class="train-route">
                <div class="train-station">
                    <div class="station-time">${train.departureTime}</div>
                    <div class="station-name">${train.from}</div>
                </div>
                <div class="train-journey">
                    <div class="journey-line">
                        <div class="journey-dot"></div>
                        <div class="journey-path"></div>
                        <div class="journey-dot"></div>
                    </div>
                    <div class="journey-duration">${train.duration}</div>
                </div>
                <div class="train-station">
                    <div class="station-time">${train.arrivalTime}</div>
                    <div class="station-name">${train.to}</div>
                </div>
            </div>
        </div>
    `;

    // Update train details container
    trainDetailsContainer.innerHTML = html;

    // Update class selection options
    document.getElementById('economy-price').textContent = `$${train.price.economy}`;
    document.getElementById('business-price').textContent = `$${train.price.business}`;
    document.getElementById('firstClass-price').textContent = `$${train.price.firstClass}`;

    document.getElementById('economy-availability').textContent = `${train.availability.economy} seats ${getSeatAvailabilityText(train.availability.economy).toLowerCase()}`;
    document.getElementById('business-availability').textContent = `${train.availability.business} seats ${getSeatAvailabilityText(train.availability.business).toLowerCase()}`;
    document.getElementById('firstClass-availability').textContent = `${train.availability.firstClass} seats ${getSeatAvailabilityText(train.availability.firstClass).toLowerCase()}`;

    // Disable class options if seats not available
    if (train.availability.economy === 0) {
        document.getElementById('economy-class').classList.add('unavailable');
        document.getElementById('economy').disabled = true;
    }

    if (train.availability.business === 0) {
        document.getElementById('business-class').classList.add('unavailable');
        document.getElementById('business').disabled = true;
    }

    if (train.availability.firstClass === 0) {
        document.getElementById('firstClass-class').classList.add('unavailable');
        document.getElementById('firstClass').disabled = true;
    }
}

// Set up seat class selection
function setupSeatClassSelection(train, bookingState) {
    const classOptions = document.querySelectorAll('input[name="class"]');
    const continueButton = document.getElementById('btn-continue-to-step-2');

    // Add event listeners to class options
    classOptions.forEach(option => {
        option.addEventListener('change', function () {
            // Remove active class from all options
            document.querySelectorAll('.travel-class').forEach(el => {
                el.classList.remove('active');
            });

            // Add active class to selected option
            this.closest('.travel-class').classList.add('active');

            // Update booking state
            bookingState.seatClass = this.value;
            bookingState.totalPrice = train.price[this.value];
        });
    });

    // Add event listener to continue button
    continueButton.addEventListener('click', function () {
        if (!bookingState.seatClass) {
            // Show error if no class selected
            Toast.error('Please select a travel class to continue');
            return;
        }

        // Navigate to next step
        navigateToStep(2);
    });
}

// Setup navigation between booking steps
function setupStepNavigation(bookingState) {
    // Step 2 back button
    document.getElementById('btn-back-to-step-1').addEventListener('click', function () {
        navigateToStep(1);
    });

    // Step 2 continue button
    document.getElementById('btn-continue-to-step-3').addEventListener('click', function () {
        // Validate passenger form
        if (!validatePassengerForm(bookingState)) {
            return;
        }

        // Update booking summary
        updateBookingSummary(bookingState);

        // Navigate to payment step
        navigateToStep(3);
    });

    // Step 3 back button
    document.getElementById('btn-back-to-step-2').addEventListener('click', function () {
        navigateToStep(2);
    });

    // Complete booking button
    document.getElementById('btn-complete-booking').addEventListener('click', function () {
        if (!validatePaymentForm(bookingState)) {
            return;
        }
        completeBooking(bookingState);
    });
}

// Setup passenger form with ability to add multiple passengers
function setupPassengerForm(bookingState) {
    const addPassengerBtn = document.getElementById('btn-add-passenger');
    const passengersContainer = document.getElementById('passengers-container');
    let passengerCount = 1;

    // Add passenger button click handler
    addPassengerBtn.addEventListener('click', function () {
        passengerCount++;

        const passengerCard = document.createElement('div');
        passengerCard.className = 'passenger-card';
        passengerCard.dataset.passengerId = passengerCount;

        passengerCard.innerHTML = `
            <div class="passenger-header">
                <h3>Passenger ${passengerCount}</h3>
                <button type="button" class="btn-remove-passenger" data-passenger-id="${passengerCount}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger-${passengerCount}-name">Full Name</label>
                    <input type="text" id="passenger-${passengerCount}-name" name="passenger-${passengerCount}-name" required>
                </div>
                <div class="form-group">
                    <label for="passenger-${passengerCount}-age">Age</label>
                    <input type="number" id="passenger-${passengerCount}-age" name="passenger-${passengerCount}-age" min="1" max="120" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="passenger-${passengerCount}-gender">Gender</label>
                    <select id="passenger-${passengerCount}-gender" name="passenger-${passengerCount}-gender" required>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="passenger-${passengerCount}-id-type">ID Type</label>
                    <select id="passenger-${passengerCount}-id-type" name="passenger-${passengerCount}-id-type" required>
                        <option value="">Select ID Type</option>
                        <option value="passport">Passport</option>
                        <option value="drivingLicense">Driving License</option>
                        <option value="aadharCard">aadhar card</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="passenger-${passengerCount}-id-number">ID Number</label>
                    <input type="text" id="passenger-${passengerCount}-id-number" name="passenger-${passengerCount}-id-number" required>
                </div>
            </div>
        `;

        passengersContainer.appendChild(passengerCard);

        // Add event listener to remove button
        passengerCard.querySelector('.btn-remove-passenger').addEventListener('click', function () {
            const passengerId = this.dataset.passengerId;
            const passengerElement = document.querySelector(`.passenger-card[data-passenger-id="${passengerId}"]`);

            if (passengerElement) {
                passengersContainer.removeChild(passengerElement);
            }
        });
    });
}

// Validate passenger form
function validatePassengerForm(bookingState) {
    const form = document.getElementById('passenger-form');
    const passengerCards = document.querySelectorAll('.passenger-card');
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();

    // Basic validation - can be extended with more complex rules
    if (!email || !phone) {
        Toast.error('Please provide contact information');
        return false;
    }

    // Extract passenger data
    bookingState.passengers = [];

    for (let card of passengerCards) {
        const passengerId = card.dataset.passengerId;

        const name = document.getElementById(`passenger-${passengerId}-name`).value.trim();
        const age = document.getElementById(`passenger-${passengerId}-age`).value.trim();
        const gender = document.getElementById(`passenger-${passengerId}-gender`).value;
        const idType = document.getElementById(`passenger-${passengerId}-id-type`).value;
        const idNumber = document.getElementById(`passenger-${passengerId}-id-number`).value.trim();

        if (!name || !age || !gender || !idType || !idNumber) {
            Toast.error('Please fill in all passenger details');
            return false;
        }

        bookingState.passengers.push({
            name,
            age,
            gender,
            idType,
            idNumber
        });
    }

    // Store contact info
    bookingState.contactInfo = {
        email,
        phone
    };

    // Update total price based on number of passengers
    bookingState.totalPrice = bookingState.train.price[bookingState.seatClass] * bookingState.passengers.length;

    return true;
}

// Set up payment form with different payment methods
function setupPaymentForm(bookingState) {
    const paymentMethods = document.querySelectorAll('.payment-method');

    // Toggle between payment methods
    paymentMethods.forEach(method => {
        const radio = method.querySelector('input[type="radio"]');

        radio.addEventListener('change', function () {
            // Hide all payment details
            document.querySelectorAll('.payment-details').forEach(el => {
                el.style.display = 'none';
            });

            // Remove active class from all methods
            paymentMethods.forEach(m => {
                m.classList.remove('active');
            });

            // Show selected payment details
            const methodType = this.value;
            document.getElementById(`${methodType}-details`).style.display = 'block';
            this.closest('.payment-method').classList.add('active');

            // Update booking state
            bookingState.paymentMethod = methodType;
        });
    });
}

// Update booking summary in payment step
function updateBookingSummary(bookingState) {
    const summaryContainer = document.getElementById('booking-summary');
    const { train, seatClass, passengers, date, totalPrice } = bookingState;

    // Format date for display
    const formattedDate = DateUtils.formatDate(date);

    // Create summary HTML
    const html = `
        <h3>Booking Summary</h3>
        <div class="summary-details">
            <div class="summary-item">
                <span class="summary-label">Train:</span>
                <span class="summary-value">${train.name} (${train.number})</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Route:</span>
                <span class="summary-value">${train.from} to ${train.to}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${formattedDate}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Time:</span>
                <span class="summary-value">${train.departureTime} - ${train.arrivalTime}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Class:</span>
                <span class="summary-value">${seatClass.charAt(0).toUpperCase() + seatClass.slice(1)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Passengers:</span>
                <span class="summary-value">${passengers.length}</span>
            </div>
            <div class="summary-item summary-total">
                <span class="summary-label">Total Price:</span>
                <span class="summary-value">$${totalPrice}</span>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = html;
}

// Complete booking and save to local storage
function completeBooking(bookingState) {
    // Generate unique booking ID
    const bookingId = generateId();

    // Create booking object
    const booking = {
        id: bookingId,
        trainId: bookingState.trainId,
        date: bookingState.date,
        seatClass: bookingState.seatClass,
        passengers: bookingState.passengers,
        contactInfo: bookingState.contactInfo,
        totalPrice: bookingState.totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    // Get existing bookings
    const bookings = StorageManager.get('bookings', []);

    // Add new booking
    bookings.push(booking);

    // Save to storage
    StorageManager.set('bookings', bookings);

    // Update confirmation details
    const confirmationEmail = document.getElementById('confirmation-email');
    confirmationEmail.textContent = bookingState.contactInfo.email;

    const confirmationDetails = document.getElementById('confirmation-details');
    confirmationDetails.innerHTML = `
        <div class="confirmation-detail-item">
            <span class="detail-label">Booking Reference:</span>
            <span class="detail-value">${bookingId.substring(0, 8).toUpperCase()}</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Train:</span>
            <span class="detail-value">${bookingState.train.name} (${bookingState.train.number})</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${DateUtils.formatDate(bookingState.date)}</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${bookingState.train.from} to ${bookingState.train.to}</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Class:</span>
            <span class="detail-value">${bookingState.seatClass.charAt(0).toUpperCase() + bookingState.seatClass.slice(1)}</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Passengers:</span>
            <span class="detail-value">${bookingState.passengers.length}</span>
        </div>
        <div class="confirmation-detail-item">
            <span class="detail-label">Total Paid:</span>
            <span class="detail-value">$${bookingState.totalPrice}</span>
        </div>
    `;

    // Update train availability
    const trains = StorageManager.get('trains', []);
    const trainIndex = trains.findIndex(t => t.id === bookingState.trainId);

    if (trainIndex !== -1) {
        trains[trainIndex].availability[bookingState.seatClass] -= bookingState.passengers.length;
        StorageManager.set('trains', trains);
    }

    // Show confirmation step
    navigateToStep(4);
}

// Helper function to navigate between steps
function navigateToStep(step) {
    // Hide all steps
    document.querySelectorAll('.booking-step-content').forEach(el => {
        el.style.display = 'none';
    });

    // Remove active class from all step indicators
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected step
    document.getElementById(`step-${step}`).style.display = 'block';

    // Update step indicators (mark current and previous steps as active)
    document.querySelectorAll('.step').forEach(el => {
        const stepNumber = parseInt(el.dataset.step);
        if (stepNumber <= step) {
            el.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo(0, 0);
}

// Helper function to determine seat availability text
function getSeatAvailabilityText(seats) {
    if (seats === 0) return 'Not Available';
    if (seats < 20) return 'Limited Seats';
    return 'Available';
}

function validatePaymentForm(bookingState) {
    // Only validate if card is selected
    if (bookingState.paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardName = document.getElementById('card-name').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvv = document.getElementById('card-cvv').value.trim();

        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            Toast.error('Please fill in all card details');
            return false;
        }
        // Optionally, add more advanced validation here (e.g., regex for card number, expiry format, etc.)
    }
    // For PayPal or Bank, no validation needed
    return true;
}