import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config, validateFirebaseConfig } from './env';

// Validate Firebase configuration
if (!validateFirebaseConfig()) {
  throw new Error('Invalid Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase
const app = initializeApp(config.firebase);

// Initialize Firestore
export const db = getFirestore(app);

export default app;