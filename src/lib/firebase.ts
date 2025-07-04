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
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';

// For debugging: This will print the Project ID to your browser's developer console.
// console.log("Attempting to initialize Firebase with Project ID:", firebaseConfig.projectId);


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
 * Writes a 'lastTested' timestamp to the currently logged-in user's document.
 * Throws an error if the write fails.
 */
export const testFirestoreConnection = async (uid: string) => {
    if (!uid) {
        throw new Error("No user ID provided for Firestore test.");
    }
    const userRef = doc(db, "users", uid);
    
    try {
        console.log(`Attempting to update document for UID: ${uid}...`);
        // Use setDoc with merge: true to update a field without overwriting the whole document.
        await setDoc(userRef, { lastTested: new Date() }, { merge: true });
        console.log("Firestore update successful!");
        return { success: true, uid: uid };
    } catch (error) {
        console.error("Firestore connectivity test failed:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}


// Function to register a user for an event
export const registerForEvent = async (userId: string, userName: string, userEmail: string, eventId: number, eventTitle: string) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        eventId: eventId.toString(),
        eventTitle,
        registeredAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(collection(db, "registrations"), registrationData);
        return { success: true, registrationId: docRef.id };
    } catch (error) {
        console.error("Error adding registration document: ", error);
        throw new Error("Failed to register for the event due to a database error.");
    }
};

// Function to register a user for a hackathon
export const registerForHackathon = async (userId: string, userName: string, userEmail: string, hackathonId: number, hackathonTitle: string) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        hackathonId: hackathonId.toString(),
        hackathonTitle,
        registeredAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(collection(db, "hackathonRegistrations"), registrationData);
        return { success: true, registrationId: docRef.id };
    } catch (error) {
        console.error("Error adding hackathon registration document: ", error);
        throw new Error("Failed to register for the hackathon due to a database error.");
    }
};


export { app, auth, db };
