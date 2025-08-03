import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from your google-services.json
const firebaseConfig = {
  apiKey: "<API_KEY>",
  authDomain: "expense-tracker-e5e97.firebaseapp.com",
  projectId: "expense-tracker-e5e97",
  storageBucket: "expense-tracker-e5e97.firebasestorage.app",
  messagingSenderId: "258713201577",
  appId: "1:258713201577:android:271279489108bae01532b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;