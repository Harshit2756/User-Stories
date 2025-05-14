// Utility functions for the train booking system

// Toast notification system
const Toast = {
    container: null,

    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 3000) {
        this.init();

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Set icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = 'check-circle';
                break;
            case 'error':
                icon = 'exclamation-circle';
                break;
            default:
                icon = 'info-circle';
        }

        // Set toast content
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">×</button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Handle close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.close(toast);
        });

        // Auto-close after duration
        setTimeout(() => {
            this.close(toast);
        }, duration);

        return toast;
    },

    close(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// LocalStorage data manager
const StorageManager = {
    // Set an item in localStorage (with support for objects)
    set(key, value) {
        try {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, stringValue);
            return true;
        } catch (error) {
            console.error('Error storing data in localStorage:', error);
            return false;
        }
    },

    // Get an item from localStorage (with support for objects)
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;

            // Try to parse as JSON, if not return as string
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        } catch (error) {
            console.error('Error retrieving data from localStorage:', error);
            return defaultValue;
        }
    },

    // Remove an item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data from localStorage:', error);
            return false;
        }
    },

    // Clear all items from localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Initialize default data if not present
    initializeDefaultData() {
        // Initialize trains data if not present
        if (!this.get('trains')) {
            const defaultTrains = [
                {
                    id: 't1',
                    name: 'Express 101',
                    number: 'EX101',
                    from: 'New York',
                    to: 'Washington DC',
                    departureTime: '08:30',
                    arrivalTime: '12:30',
                    duration: '4h 0m',
                    price: {
                        economy: 45,
                        business: 85,
                        firstClass: 120
                    },
                    availability: {
                        economy: 120,
                        business: 40,
                        firstClass: 15
                    }
                },
                {
                    id: 't2',
                    name: 'Coastal Line',
                    number: 'CL202',
                    from: 'Boston',
                    to: 'New York',
                    departureTime: '09:15',
                    arrivalTime: '12:45',
                    duration: '3h 30m',
                    price: {
                        economy: 35,
                        business: 65,
                        firstClass: 95
                    },
                    availability: {
                        economy: 80,
                        business: 25,
                        firstClass: 10
                    }
                },
                {
                    id: 't3',
                    name: 'Western Express',
                    number: 'WE303',
                    from: 'Chicago',
                    to: 'Denver',
                    departureTime: '10:00',
                    arrivalTime: '16:30',
                    duration: '6h 30m',
                    price: {
                        economy: 75,
                        business: 130,
                        firstClass: 190
                    },
                    availability: {
                        economy: 150,
                        business: 60,
                        firstClass: 20
                    }
                },
                {
                    id: 't4',
                    name: 'Southern Railway',
                    number: 'SR404',
                    from: 'Atlanta',
                    to: 'Miami',
                    departureTime: '07:45',
                    arrivalTime: '14:15',
                    duration: '6h 30m',
                    price: {
                        economy: 65,
                        business: 120,
                        firstClass: 180
                    },
                    availability: {
                        economy: 95,
                        business: 35,
                        firstClass: 12
                    }
                },
                {
                    id: 't5',
                    name: 'Pacific Bullet',
                    number: 'PB505',
                    from: 'Los Angeles',
                    to: 'San Francisco',
                    departureTime: '11:30',
                    arrivalTime: '14:45',
                    duration: '3h 15m',
                    price: {
                        economy: 55,
                        business: 95,
                        firstClass: 150
                    },
                    availability: {
                        economy: 110,
                        business: 40,
                        firstClass: 15
                    }
                }
            ];
            this.set('trains', defaultTrains);
        }

        // Initialize cities data if not present
        if (!this.get('cities')) {
            const defaultCities = [
                'New York', 'Washington DC', 'Boston', 'Chicago',
                'Denver', 'Atlanta', 'Miami', 'Los Angeles', 'San Francisco'
            ];
            this.set('cities', defaultCities);
        }

        // Initialize bookings data if not present
        if (!this.get('bookings')) {
            this.set('bookings', []);
        }
    }
};

// Form validation utility
const FormValidator = {
    validate(form, rules) {
        let isValid = true;
        const errors = {};

        for (const field in rules) {
            const value = form[field].value.trim();
            const fieldRules = rules[field];

            // Required check
            if (fieldRules.required && value === '') {
                isValid = false;
                errors[field] = fieldRules.requiredMessage || 'This field is required';
                continue;
            }

            // Pattern check (if provided and field has value)
            if (fieldRules.pattern && value !== '' && !fieldRules.pattern.test(value)) {
                isValid = false;
                errors[field] = fieldRules.patternMessage || 'Invalid format';
                continue;
            }

            // Min length check (if provided and field has value)
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                isValid = false;
                errors[field] = fieldRules.minLengthMessage || `Minimum length is ${fieldRules.minLength}`;
                continue;
            }

            // Custom validation (if provided)
            if (fieldRules.custom && !fieldRules.custom(value)) {
                isValid = false;
                errors[field] = fieldRules.customMessage || 'Invalid value';
                continue;
            }
        }

        return { isValid, errors };
    },

    showErrors(form, errors) {
        // First, remove all existing error messages
        const existingErrors = form.querySelectorAll('.error-message');
        existingErrors.forEach(el => el.remove());

        // Remove error classes
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

        // Add new error messages
        for (const field in errors) {
            const element = form.querySelector(`[name="${field}"]`);
            if (element) {
                // Add error class to input
                element.classList.add('error');

                // Create and add error message element
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errors[field];

                // Insert after the input element
                element.parentNode.insertBefore(errorElement, element.nextSibling);
            }
        }
    }
};

// Date formatter utility
const DateUtils = {
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateForInput(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    },

    getTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    },

    getDaysFromToday(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }
};

// Generate a unique ID
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize default data on page load
document.addEventListener('DOMContentLoaded', function () {
    // Initialize localStorage with default data
    StorageManager.initializeDefaultData();

    // Add the active class to the current page link in the navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        if (currentPath.endsWith(link.getAttribute('href'))) {
            link.classList.add('active');
        } else if (currentPath === '/' && link.getAttribute('href') === 'index.html') {
            link.classList.add('active');
        }
    });
}); 