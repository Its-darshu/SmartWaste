# Smart Waste Reporting System

A comprehensive waste management and reporting system built with React frontend, Flask backend, and Firebase database.

## Features

- **Waste Report Submission**: Citizens can report waste issues with location and photos
- **Real-time Dashboard**: View all waste reports on an interactive map
- **User Authentication**: Secure login and registration system
- **Admin Panel**: Manage waste reports and track cleanup status
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Flask (Python)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: CSS Modules / Tailwind CSS

## Project Structure

```
SmartWaste/
├── frontend/          # React application
├── backend/           # Flask API server
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Firebase account

### Installation

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Add your Firebase config to the frontend
5. Add service account key to the backend

## API Endpoints

- `GET /api/reports` - Get all waste reports
- `POST /api/reports` - Create a new waste report
- `PUT /api/reports/{id}` - Update report status
- `DELETE /api/reports/{id}` - Delete a report
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request