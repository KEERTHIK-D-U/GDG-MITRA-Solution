// Important: Replace with your Firebase project's configuration.
// Go to your Firebase project's settings, and in the "General" tab,
// find your web app and copy the configuration object.
const firebaseConfig = {
  apiKey: "AIza....",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from 'firebase/auth';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
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
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}


export { app, auth, db };
