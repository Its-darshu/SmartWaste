import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDboF6AIPbxhuMpA8Pue8z7dC2cjXkpdgM",
  authDomain: "waste-report-c646f.firebaseapp.com",
  projectId: "waste-report-c646f",
  storageBucket: "waste-report-c646f.firebasestorage.app",
  messagingSenderId: "336328681545",
  appId: "1:336328681545:web:7e83aba0761660d3b1f798",
  measurementId: "G-K77DT5Z97B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;