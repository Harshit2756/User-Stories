# TrainConnect - Train Reservation System

TrainConnect is a modern web-based train reservation system that allows users to search for trains, check seat availability, book tickets, and manage their booking history. The application is built with HTML, CSS, and vanilla JavaScript, using local storage for data persistence.

## Features

### 1. Train Search and Seat Availability

- Search for trains based on origin, destination, and date
- View comprehensive details about available trains
- Check seat availability across different travel classes
- Filter and sort search results

### 2. Ticket Booking

- Select preferred travel class with detailed features and pricing
- Add multiple passengers with validation
- Complete the booking process with a user-friendly step-by-step interface
- Receive booking confirmation with comprehensive details

### 3. Booking History

- View all past and upcoming bookings
- Search and filter bookings by various criteria
- View detailed information about each booking
- Cancel bookings if needed

## Project Structure

```
TrainConnect/
│
├── index.html                  # Landing page
├── assets/
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   ├── js/
│   │   ├── main.js             # Utility functions and data initialization
│   │   ├── dashboard.js        # Dashboard functionality
│   │   ├── train-search.js     # Train search functionality
│   │   ├── booking.js          # Booking process functionality
│   │   └── booking-history.js  # Booking history functionality
│   ├── data/                   # Local data storage
│   └── images/                 # Images and icons
│
└── pages/
    ├── dashboard.html          # User dashboard
    ├── train-search.html       # Train search page
    ├── booking.html            # Ticket booking page
    └── booking-history.html    # Booking history page
```

## Technology Stack

- HTML5
- CSS3 with flexbox and grid for responsive layouts
- Vanilla JavaScript (ES6+)
- Local Storage API for data persistence
- Font Awesome for icons

## Getting Started

1. Clone or download the repository
2. Open `index.html` in your web browser
3. Explore the different features of the application

## Data Storage

The application uses browser's local storage to persist data. The following data structures are used:

- `trains`: List of available trains with routes, prices, and seat availability
- `cities`: List of cities for origin and destination selection
- `bookings`: User's booking history

## Future Improvements

- User authentication and account management
- Server-side integration for real data and persistence
- Payment gateway integration
- Email notifications for booking confirmations and updates
- Mobile application development

## Credits

This project was developed as a demo for a train reservation system based on user requirements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
