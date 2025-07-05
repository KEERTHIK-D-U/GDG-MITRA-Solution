
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
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, onSnapshot, orderBy } from "firebase/firestore";
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
    linkedinUrl?: string;
    techStacks?: string;
    bio?: string;
}

export interface EventRegistration {
    id: string;
    userId: string;
    eventTitle: string;
    registeredAt: any;
}

export interface HackathonRegistration {
    id: string;
    userId: string;
    hackathonTitle: string;
    registeredAt: any; // Firestore Timestamp
}

export interface ProjectContribution {
    id: string;
    userId: string;
    projectTitle: string;
    contributedAt: any; // Firestore Timestamp
}

export interface Event {
    id: string; // Firestore document ID
    title: string;
    date: string;
    location: string;
    description: string;
    imageUrl: string;
    hostId: string;
    hostName: string;
    createdAt: any; // Firestore Timestamp
}

export interface Project {
    id: string; // Firestore document ID
    title: string;
    description: string;
    imageUrl: string;
    tags: string[];
    hostId: string;
    hostName: string;
    createdAt: any; // Firestore Timestamp
}

export interface Hackathon {
    id: string; // Firestore document ID
    title: string;
    dates: string;
    description: string;
    imageUrl: string;
    hostId: string;
    hostName: string;
    createdAt: any; // Firestore Timestamp
}


// Function to create user profile in Firestore
export const createUserProfile = async (user: FirebaseUser, name: string, role: UserRole, additionalData: { linkedinUrl?: string } = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        role,
        linkedinUrl: additionalData.linkedinUrl || "",
        techStacks: "",
        bio: "Passionate community member and tech enthusiast.",
    };
    try {
        await setDoc(userRef, userProfile);
        return userProfile;
    } catch (error: any) {
        console.error("Error creating user profile: ", error);
        if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Check your security rules to allow creating documents in the 'users' collection.");
        }
        throw new Error("Failed to create user profile due to a database error.");
    }
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
    } catch (error: any) {
        console.error("Error fetching user profile:", error);
         if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules to allow reading from the 'users' collection.");
        }
        throw new Error("Failed to fetch user profile due to a database error.");
    }
}

// Function to update a user's profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, "users", uid);
    try {
        await setDoc(userRef, data, { merge: true });
    } catch (error: any) {
        console.error("Error updating user profile:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow updating documents in the 'users' collection.");
        }
        throw new Error("Failed to update user profile due to a database error.");
    }
};

// Function to get a user's event registrations
export const getUserRegistrations = async (userId: string): Promise<EventRegistration[]> => {
    const registrationsRef = collection(db, "registrations");
    const q = query(registrationsRef, where("userId", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        const registrations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
        return registrations;
    } catch (error: any) {
        console.error("Error fetching user registrations:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow reading from the 'registrations' collection.");
        }
        throw new Error("Failed to fetch event history due to a database error.");
    }
}

// Function to get a user's hackathon registrations
export const getUserHackathonRegistrations = async (userId: string): Promise<HackathonRegistration[]> => {
    const registrationsRef = collection(db, "hackathonRegistrations");
    const q = query(registrationsRef, where("userId", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HackathonRegistration));
    } catch (error: any) {
        console.error("Error fetching hackathon registrations:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow reading from the 'hackathonRegistrations' collection.");
        }
        throw new Error("Failed to fetch hackathon history due to a database error.");
    }
}

// Function to get a user's project contributions
export const getUserProjectContributions = async (userId: string): Promise<ProjectContribution[]> => {
    const contributionsRef = collection(db, "projectContributions");
    const q = query(contributionsRef, where("userId", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectContribution));
    } catch (error: any) {
        console.error("Error fetching project contributions:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow reading from the 'projectContributions' collection.");
        }
        throw new Error("Failed to fetch project contributions due to a database error.");
    }
}


// Function to get all users from Firestore, excluding admins and the current user
export const getAllUsers = async (currentUserId: string): Promise<UserProfile[]> => {
    const usersRef = collection(db, "users");
    // Exclude the current user from the list
    const q = query(usersRef, where("uid", "!=", currentUserId), where("role", "!=", "admin"));
    try {
        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });
        return users;
    } catch (error: any) {
        console.error("Error fetching all users:", error);
        if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules to allow reading from the 'users' collection.");
        }
        throw new Error("Failed to fetch all users due to a database error.");
    }
};

// Function to delete a user's profile from Firestore
export const deleteUserProfile = async (uid: string): Promise<void> => {
    const userRef = doc(db, "users", uid);
    try {
        await deleteDoc(userRef);
    } catch (error: any) {
        console.error("Error deleting user profile:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow deleting documents from the 'users' collection.");
        }
        throw new Error("Failed to delete user profile due to a database error.");
    }
};

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
        await setDoc(userRef, { lastTested: new Date() }, { merge: true });
        console.log("Firestore update successful!");
        return { success: true, uid: uid };
    } catch (error: any) {
        console.error("Firestore connectivity test failed:", error);
        if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules to allow writes to the 'users' collection for your user.");
        }
        throw new Error("Firestore connectivity test failed with a database error.");
    }
}


// Function to register a user for an event
export const registerForEvent = async (userId: string, userName: string | null, userEmail: string | null, eventId: string, eventTitle: string) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        eventId: eventId,
        eventTitle,
        registeredAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(collection(db, "registrations"), registrationData);
        return { success: true, registrationId: docRef.id };
    } catch (error: any) {
        console.error("Error adding registration document: ", error);
        if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules to allow writes to the 'registrations' collection.");
        }
        throw new Error("Failed to register for the event due to a database error.");
    }
};

// Function to register a user for a hackathon
export const registerForHackathon = async (userId: string, userName: string | null, userEmail: string | null, hackathonId: string, hackathonTitle: string) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        hackathonId: hackathonId,
        hackathonTitle,
        registeredAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(collection(db, "hackathonRegistrations"), registrationData);
        return { success: true, registrationId: docRef.id };
    } catch (error: any) {
        console.error("Error adding hackathon registration document: ", error);
        if (error.code === 'permission-denied') {
             throw new Error("Firestore permission denied. Please check your security rules to allow writes to the 'hackathonRegistrations' collection.");
        }
        throw new Error("Failed to register for the hackathon due to a database error.");
    }
};

// Function to log a project contribution
export const contributeToProject = async (userId: string, userName: string | null, userEmail: string | null, projectId: string, projectTitle: string) => {
    const contributionsRef = collection(db, "projectContributions");
    const q = query(contributionsRef, where("userId", "==", userId), where("projectId", "==", projectId));
    const existingContribution = await getDocs(q);
    if (!existingContribution.empty) {
        return { success: true, message: "Already contributed." };
    }

    const contributionData = {
        userId,
        userName,
        userEmail,
        projectId: projectId,
        projectTitle,
        contributedAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(contributionsRef, contributionData);
        return { success: true, contributionId: docRef.id };
    } catch (error: any) {
        console.error("Error adding project contribution document: ", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow writes to the 'projectContributions' collection.");
        }
        throw new Error("Failed to log project contribution due to a database error.");
    }
};


// Functions to create items
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating event:", error);
        throw new Error("Failed to create event.");
    }
};

export const createProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, "projects"), {
            ...projectData,
            createdAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project.");
    }
};

// Functions to delete items
export const deleteEvent = async (eventId: string) => {
    try {
        await deleteDoc(doc(db, "events", eventId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting event:", error);
        throw new Error("Failed to delete event.");
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        await deleteDoc(doc(db, "projects", projectId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting project:", error);
        throw new Error("Failed to delete project.");
    }
};

export const deleteHackathon = async (hackathonId: string) => {
    try {
        await deleteDoc(doc(db, "hackathons", hackathonId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting hackathon:", error);
        throw new Error("Failed to delete hackathon.");
    }
};

// Functions to get all items (for public pages)
export const getEvents = (callback: (events: Event[]) => void) => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        callback(events);
    });
};

export const getProjects = (callback: (projects: Project[]) => void) => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};

export const getHackathons = (callback: (hackathons: Hackathon[]) => void) => {
    const q = query(collection(db, "hackathons"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const hackathons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hackathon));
        callback(hackathons);
    });
};

// Functions to get host-specific items (for dashboard)
export const getEventsByHost = (hostId: string, callback: (events: Event[]) => void) => {
    const q = query(collection(db, "events"), where("hostId", "==", hostId));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        callback(events);
    });
};

export const getProjectsByHost = (hostId: string, callback: (projects: Project[]) => void) => {
    const q = query(collection(db, "projects"), where("hostId", "==", hostId));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    });
};


export { app, auth, db };
