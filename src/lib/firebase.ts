
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
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { User as FirebaseUser } from 'firebase/auth';

// For debugging: This will print the Project ID to your browser's developer console.
// console.log("Attempting to initialize Firebase with Project ID:", firebaseConfig.projectId);


// Initialize Firebase
let app;
if (!getApps().length) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
        console.error("Firebase config is not fully set. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET are all present in .env.local and restart your server.");
    }
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export type UserRole = "user" | "admin" | "mentor";

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    linkedinUrl?: string;
    college?: string;
    techStacks?: string;
    bio?: string;
    hasCompletedTutorial?: boolean;
}

export type RegistrationType = 'participant' | 'volunteer';

export interface EventRegistration {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    eventId: string;
    eventTitle: string;
    registeredAt: any;
    registrationType: RegistrationType;
}

export interface HackathonRegistration {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    hackathonId: string;
    hackathonTitle: string;
    registeredAt: any; // Firestore Timestamp
    registrationType: RegistrationType;
}

export interface ProjectContribution {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    projectId: string;
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
    hostEmail: string;
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
    hostEmail: string;
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
    hostEmail: string;
    createdAt: any; // Firestore Timestamp
}

// Function to create user profile in Firestore
export const createUserProfile = async (user: FirebaseUser, name: string, role: UserRole, additionalData: { linkedinUrl?: string; college?: string; } = {}) => {
    const userRef = doc(db, "users", user.uid);
    const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        role,
        linkedinUrl: additionalData.linkedinUrl || "",
        college: additionalData.college || "",
        techStacks: "",
        bio: "Passionate community member and tech enthusiast.",
        hasCompletedTutorial: false,
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
export const registerForEvent = async (userId: string, userName: string | null, userEmail: string | null, eventId: string, eventTitle: string, registrationType: RegistrationType) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        eventId: eventId,
        eventTitle,
        registrationType,
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
export const registerForHackathon = async (userId: string, userName: string | null, userEmail: string | null, hackathonId: string, hackathonTitle: string, registrationType: RegistrationType) => {
    const registrationData = {
        userId,
        userName,
        userEmail,
        hackathonId: hackathonId,
        hackathonTitle,
        registrationType,
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

// --- Storage Functions ---
export const uploadImage = async (file: File): Promise<string> => {
    const filePath = `images/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Failed to upload image.");
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
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow creating documents in the 'events' collection.");
        }
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
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow creating documents in the 'projects' collection.");
        }
        throw new Error("Failed to create project.");
    }
};

export const createHackathon = async (hackathonData: Omit<Hackathon, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, "hackathons"), {
            ...hackathonData,
            createdAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating hackathon:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow creating documents in the 'hackathons' collection.");
        }
        throw new Error("Failed to create hackathon.");
    }
};

// Functions to delete items
export const deleteEvent = async (eventId: string) => {
    try {
        await deleteDoc(doc(db, "events", eventId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting event:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow deleting from the 'events' collection.");
        }
        throw new Error("Failed to delete event.");
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        await deleteDoc(doc(db, "projects", projectId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting project:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow deleting from the 'projects' collection.");
        }
        throw new Error("Failed to delete project.");
    }
};

export const deleteHackathon = async (hackathonId: string) => {
    try {
        await deleteDoc(doc(db, "hackathons", hackathonId));
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting hackathon:", error);
        if (error.code === 'permission-denied') {
            throw new Error("Firestore permission denied. Check your security rules to allow deleting from the 'hackathons' collection.");
        }
        throw new Error("Failed to delete hackathon.");
    }
};

// Generic error handler for snapshot listeners
const handleSnapshotError = (error: Error, collectionName: string, onError: (error: Error) => void) => {
    console.error(`Error fetching ${collectionName}:`, error);
    const anyError = error as any;
    if (anyError.code === 'permission-denied') {
        onError(new Error(`Firestore permission denied. Please check your security rules to allow reading from the '${collectionName}' collection.`));
    } else {
        onError(new Error(`Failed to fetch ${collectionName} due to a database error.`));
    }
};


// Functions to get all items (for public pages)
export const getEvents = (callback: (events: Event[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        callback(events);
    }, (error) => handleSnapshotError(error, "events", onError));
};

export const getProjects = (callback: (projects: Project[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    }, (error) => handleSnapshotError(error, "projects", onError));
};

export const getHackathons = (callback: (hackathons: Hackathon[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "hackathons"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const hackathons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hackathon));
        callback(hackathons);
    }, (error) => handleSnapshotError(error, "hackathons", onError));
};

// Functions to get host-specific items (for dashboard)
export const getEventsByHost = (hostId: string, callback: (events: Event[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "events"), where("hostId", "==", hostId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        callback(events);
    }, (error) => handleSnapshotError(error, "events", onError));
};

export const getProjectsByHost = (hostId: string, callback: (projects: Project[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "projects"), where("hostId", "==", hostId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        callback(projects);
    }, (error) => handleSnapshotError(error, "projects", onError));
};

export const getHackathonsByHost = (hostId: string, callback: (hackathons: Hackathon[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "hackathons"), where("hostId", "==", hostId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const hackathons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hackathon));
        callback(hackathons);
    }, (error) => handleSnapshotError(error, "hackathons", onError));
};

// Functions to get registrations for the host dashboard
export const getRegistrationsForEvent = (eventId: string, callback: (registrations: EventRegistration[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "registrations"), where("eventId", "==", eventId), orderBy("registeredAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EventRegistration));
        callback(registrations);
    }, (error) => handleSnapshotError(error, "registrations", onError));
};

export const getRegistrationsForHackathon = (hackathonId: string, callback: (registrations: HackathonRegistration[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "hackathonRegistrations"), where("hackathonId", "==", hackathonId), orderBy("registeredAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HackathonRegistration));
        callback(registrations);
    }, (error) => handleSnapshotError(error, "hackathonRegistrations", onError));
};

export const getContributionsForProject = (projectId: string, callback: (contributions: ProjectContribution[]) => void, onError: (error: Error) => void) => {
    const q = query(collection(db, "projectContributions"), where("projectId", "==", projectId), orderBy("contributedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const contributions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectContribution));
        callback(contributions);
    }, (error) => handleSnapshotError(error, "projectContributions", onError));
};

export const getUsers = (currentUserId: string, callback: (users: UserProfile[]) => void, onError: (error: Error) => void) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "user"));
    return onSnapshot(q, (snapshot) => {
        const usersData = snapshot.docs
            .map(doc => doc.data() as UserProfile)
            .filter(user => user.uid !== currentUserId);
        callback(usersData);
    }, (error) => handleSnapshotError(error, "users", onError));
}

export const getMentors = (currentUserId: string, callback: (users: UserProfile[]) => void, onError: (error: Error) => void) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", "mentor"));
    
    return onSnapshot(q, (snapshot) => {
        const mentors = snapshot.docs
            .map(doc => doc.data() as UserProfile)
            .filter(mentor => mentor.uid !== currentUserId);
        callback(mentors);
    }, (error) => handleSnapshotError(error, "users", onError));
};

export { app, auth, db, storage };
