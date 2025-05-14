
// Toggle password visibility
function togglePasswordVisibility(passwordField, toggleButton) {
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
        passwordField.type = 'password';
        toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Show alert message
function showAlert(message, type = 'info', container = '.alert-container', autoClose = true) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll(`${container} .alert`);
    existingAlerts.forEach(alert => alert.remove());

    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Add to container
    const alertContainer = document.querySelector(container);
    if (alertContainer) {
        alertContainer.appendChild(alertElement);

        // Auto close after 5 seconds if autoClose is true
        if (autoClose) {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }, 5000);
        }
    }
}

// Get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


// Local storage helpers
const localStorageUtil = {
    set: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: function (key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    },
    remove: function (key) {
        localStorage.removeItem(key);
    },
    clear: function () {
        localStorage.clear();
    }
};

// Session and authentication helpers
const auth = {
    // Login - modified to bypass session storage
    login: function (userData, remember = false) {
        console.log('Login successful for:', userData);
        return true;
    },
    // Check if user is logged in - always return true
    isLoggedIn: function () {
        return true;
    },
    // Get current user - return dummy user data
    getCurrentUser: function () {
        return {
            id: 'user-1234',
            username: 'Harshit',
            role: 'customer',
            email: 'harshit@gmail.com'
        };
    },
    // Logout - just redirect without clearing storage
    logout: function () {
        window.location.href = '../../pages/auth/login.html';
    }
};
