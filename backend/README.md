# SmartWaste Backend API

Flask backend for the SmartWaste reporting system.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   ```bash
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up Firebase Admin SDK:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Download the JSON file and save it as `firebase-service-account-key.json` in this directory

5. Run the development server:
   ```bash
   python app.py
   ```

## API Endpoints

### Reports
- `GET /api/reports` - Get all waste reports
  - Query params: `category`, `status`, `limit`
- `POST /api/reports` - Create a new report (requires auth)
- `PUT /api/reports/<id>` - Update a report (requires auth & ownership)
- `DELETE /api/reports/<id>` - Delete a report (requires auth & ownership)

### User
- `GET /api/user/profile` - Get user profile (requires auth)

### Statistics
- `GET /api/stats` - Get system statistics

### Health
- `GET /api/health` - Health check

## Authentication

All protected endpoints require a Firebase Auth token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## Environment Variables

- `PORT` - Server port (default: 5000)