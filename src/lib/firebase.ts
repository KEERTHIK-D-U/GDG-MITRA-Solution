// Important: This file reads your Firebase configuration from environment variables.
// Make sure to populate the .env.local file with your project's credentials.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';

// For debugging: This will print the Project ID to your browser's developer console.
console.log("Attempting to initialize Firebase with Project ID:", firebaseConfig.projectId);


// Initialize Firebase
let app;
if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase config is not set. Please update .env.local and restart your server.");
    }
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export type UserRole = "volunteer" | "host" | "admin";

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
}

// Function to create user profile in Firestore
export const createUserProfile = async (user: FirebaseUser, name: string, role: UserRole) => {
    const userRef = doc(db, "users", user.uid);
    const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        role,
    };
    await setDoc(userRef, userProfile);
    return userProfile;
};

// Function to get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, "users", uid);
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        // This is a good place to handle specific errors, e.g., permissions
        throw error;
    }
}

/**
 * A test function to verify Firestore connectivity.
 * Writes a document to the 'users' collection and reads it back.
 * Throws an error if any step fails.
 */
export const testFirestoreConnection = async () => {
    const testDocId = 'test-user-for-connectivity';
    const userRef = doc(db, "users", testDocId);
    
    try {
        console.log("Attempting to write to Firestore...");
        const testData = {
            uid: testDocId,
            email: 'test@example.com',
            name: 'Firestore Test User',
            role: 'volunteer' as UserRole
        };
        await setDoc(userRef, testData);
        console.log("Write successful! Document ID:", testDocId);

        console.log("Attempting to read from Firestore...");
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            console.log("Read successful! Document data:", docSnap.data());
            return docSnap.data();
        } else {
            throw new Error("Test document was written but could not be read back.");
        }
    } catch (error) {
        console.error("Firestore connectivity test failed:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}


export { app, auth, db };
