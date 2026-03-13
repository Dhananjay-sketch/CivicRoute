import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin once and reuse the same app instance.
const firebaseConfig = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Service account keys from .env usually store newlines as \n.
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

export const db = admin.firestore();
