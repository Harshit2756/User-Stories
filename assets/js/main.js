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
                    id: 'T001',
                    name: 'Western Express',
                    number: 'WX101',
                    from: 'Surat',
                    to: 'Mumbai',
                    departureTime: '07:00',
                    arrivalTime: '10:00',
                    duration: '3h 0m',
                    price: {
                        economy: 300,
                        business: 600,
                        firstClass: 900
                    },
                    availability: {
                        economy: 100,
                        business: 20,
                        firstClass: 0 // unavailable
                    }
                },
                {
                    id: 'T002',
                    name: 'Sabarmati Superfast',
                    number: 'SS102',
                    from: 'Surat',
                    to: 'Ahmedabad',
                    departureTime: '08:30',
                    arrivalTime: '11:30',
                    duration: '3h 0m',
                    price: {
                        economy: 250,
                        business: 550,
                        firstClass: 850
                    },
                    availability: {
                        economy: 0, // unavailable
                        business: 10,
                        firstClass: 5
                    }
                },
                {
                    id: 'T003',
                    name: 'Pune Intercity',
                    number: 'PI103',
                    from: 'Surat',
                    to: 'Pune',
                    departureTime: '06:00',
                    arrivalTime: '10:30',
                    duration: '4h 30m',
                    price: {
                        economy: 350,
                        business: 700,
                        firstClass: 1050
                    },
                    availability: {
                        economy: 50,
                        business: 0, // unavailable
                        firstClass: 10
                    }
                },
                {
                    id: 'T004',
                    name: 'Mumbai Express',
                    number: 'MX104',
                    from: 'Mumbai',
                    to: 'Surat',
                    departureTime: '09:00',
                    arrivalTime: '12:00',
                    duration: '3h 0m',
                    price: {
                        economy: 300,
                        business: 600,
                        firstClass: 900
                    },
                    availability: {
                        economy: 80,
                        business: 25,
                        firstClass: 15
                    }
                },
                {
                    id: 'T005',
                    name: 'Mumbai-Ahmedabad Mail',
                    number: 'MA105',
                    from: 'Mumbai',
                    to: 'Ahmedabad',
                    departureTime: '10:00',
                    arrivalTime: '15:00',
                    duration: '5h 0m',
                    price: {
                        economy: 400,
                        business: 750,
                        firstClass: 1100
                    },
                    availability: {
                        economy: 0,
                        business: 15,
                        firstClass: 8
                    }
                },
                {
                    id: 'T006',
                    name: 'Deccan Queen',
                    number: 'DQ106',
                    from: 'Mumbai',
                    to: 'Pune',
                    departureTime: '07:15',
                    arrivalTime: '10:00',
                    duration: '2h 45m',
                    price: {
                        economy: 200,
                        business: 450,
                        firstClass: 700
                    },
                    availability: {
                        economy: 120,
                        business: 50,
                        firstClass: 20
                    }
                },
                {
                    id: 'T007',
                    name: 'Ahmedabad Express',
                    number: 'AE107',
                    from: 'Ahmedabad',
                    to: 'Surat',
                    departureTime: '06:45',
                    arrivalTime: '09:45',
                    duration: '3h 0m',
                    price: {
                        economy: 250,
                        business: 500,
                        firstClass: 800
                    },
                    availability: {
                        economy: 0,
                        business: 0,
                        firstClass: 0 // all full
                    }
                },
                {
                    id: 'T008',
                    name: 'Gujarat Queen',
                    number: 'GQ108',
                    from: 'Ahmedabad',
                    to: 'Mumbai',
                    departureTime: '12:00',
                    arrivalTime: '17:00',
                    duration: '5h 0m',
                    price: {
                        economy: 420,
                        business: 770,
                        firstClass: 1200
                    },
                    availability: {
                        economy: 100,
                        business: 25,
                        firstClass: 0
                    }
                },
                {
                    id: 'T009',
                    name: 'Pune Fast',
                    number: 'PF109',
                    from: 'Ahmedabad',
                    to: 'Pune',
                    departureTime: '05:30',
                    arrivalTime: '12:30',
                    duration: '7h 0m',
                    price: {
                        economy: 500,
                        business: 900,
                        firstClass: 1300
                    },
                    availability: {
                        economy: 60,
                        business: 10,
                        firstClass: 5
                    }
                },
                {
                    id: 'T010',
                    name: 'Pune Express',
                    number: 'PE110',
                    from: 'Pune',
                    to: 'Surat',
                    departureTime: '11:15',
                    arrivalTime: '15:45',
                    duration: '4h 30m',
                    price: {
                        economy: 350,
                        business: 700,
                        firstClass: 1050
                    },
                    availability: {
                        economy: 30,
                        business: 0,
                        firstClass: 2
                    }
                },
                {
                    id: 'T011',
                    name: 'Pune-Mumbai Local',
                    number: 'PM111',
                    from: 'Pune',
                    to: 'Mumbai',
                    departureTime: '06:45',
                    arrivalTime: '09:15',
                    duration: '2h 30m',
                    price: {
                        economy: 180,
                        business: 400,
                        firstClass: 650
                    },
                    availability: {
                        economy: 100,
                        business: 40,
                        firstClass: 0
                    }
                },
                {
                    id: 'T012',
                    name: 'Ahmedabad Intercity',
                    number: 'AI112',
                    from: 'Pune',
                    to: 'Ahmedabad',
                    departureTime: '07:00',
                    arrivalTime: '14:00',
                    duration: '7h 0m',
                    price: {
                        economy: 480,
                        business: 850,
                        firstClass: 1250
                    },
                    availability: {
                        economy: 0,
                        business: 20,
                        firstClass: 10
                    }
                }
            ];
            this.set('trains', defaultTrains);
        }

        // Initialize cities data if not present
        if (!this.get('cities')) {
            const defaultCities = ['Surat', 'Mumbai', 'Ahmedabad', 'Pune'];
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