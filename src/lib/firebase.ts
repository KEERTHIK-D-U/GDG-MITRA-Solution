// Important: Replace this with your Firebase project's configuration.
// To get your config object:
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Click the gear icon (Project settings) in the top-left sidebar.
// 4. In the "General" tab, scroll down to "Your apps".
// 5. If you haven't created a web app, click the "</>" icon to create one.
// 6. Find your web app and copy the `firebaseConfig` object.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- PASTE YOURS HERE
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // <--- PASTE YOURS HERE
  projectId: "YOUR_PROJECT_ID", // <--- PASTE YOURS HERE
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // <--- PASTE YOURS HERE
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- PASTE YOURS HERE
  appId: "YOUR_APP_ID" // <--- PASTE YOURS HERE
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
