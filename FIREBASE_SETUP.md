# Firebase Setup Guide

Follow these steps to configure Firebase for your SmartWaste application.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `waste-report-c646f` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Set up Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" provider
3. Optionally enable other providers (Google, Facebook, etc.)

## 3. Set up Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" for now
3. Select a location close to your users
4. Click "Done"

### Firestore Security Rules (for production)

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own waste reports
    match /wasteReports/{reportId} {
      allow read: if true; // Anyone can read reports (for public dashboard)
      allow create: if request.auth != null && request.auth.uid == resource.data.reportedBy;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.reportedBy || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && request.auth.uid == resource.data.reportedBy;
    }
    
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Set up Storage

1. Go to "Storage" → "Get started"
2. Choose "Start in test mode"
3. Select the same location as your Firestore

### Storage Security Rules (for production)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /waste-reports/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Frontend Configuration

Your Firebase configuration is already set up in `frontend/src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyDboF6AIPbxhuMpA8Pue8z7dC2cjXkpdgM",
  authDomain: "waste-report-c646f.firebaseapp.com",
  projectId: "waste-report-c646f",
  storageBucket: "waste-report-c646f.firebasestorage.app",
  messagingSenderId: "336328681545",
  appId: "1:336328681545:web:7e83aba0761660d3b1f798",
  measurementId: "G-K77DT5Z97B"
};
```

## 6. Backend Configuration

1. In Firebase Console, go to "Project Settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-service-account-key.json`
5. Place it in the `backend/` directory

⚠️ **Security Note**: Never commit the service account key to version control. Add it to your `.gitignore`:

```
# Firebase
firebase-service-account-key.json
```

## 7. Test the Setup

1. Start the backend server:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python app.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Open http://localhost:3000
4. Try registering a new user and creating a waste report

## 8. Data Structure

The app uses these Firestore collections:

### wasteReports
```json
{
  "title": "Garbage overflow on Main Street",
  "description": "Large pile of garbage bags blocking sidewalk",
  "category": "Garbage Overflow",
  "location": {
    "lat": 28.6139,
    "lng": 77.2090,
    "address": "Main Street, Delhi, India"
  },
  "images": ["https://firebase-storage-url/image1.jpg"],
  "status": "Pending",
  "priority": "High",
  "reportedBy": "user-uid",
  "reportedAt": "2025-10-16T10:30:00Z",
  "updatedAt": "2025-10-16T10:30:00Z"
}
```

### users (optional, for user profiles)
```json
{
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "citizen",
  "createdAt": "2025-10-16T10:30:00Z"
}
```

## Troubleshooting

1. **CORS errors**: Make sure your domain is added to Firebase Auth authorized domains
2. **Permission denied**: Check your Firestore security rules
3. **Storage upload fails**: Verify Storage security rules and file size limits
4. **Backend auth errors**: Ensure service account key is properly configured