"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getUserProfile, UserProfile } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);
          const userProfile = await getUserProfile(fbUser.uid);
          setUser(userProfile);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error("Auth context error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Profile Load Error",
          description: error.message || "An unknown error occurred while fetching your profile.",
        });
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // When loading, we can't show the children because they might try to access
  // auth state, so we render null or a loading indicator.
  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// A hook to protect routes
export function useRequireAuth(role: 'host' | 'volunteer' | 'admin' | null = null, redirectUrl = '/login') {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Don't do anything while loading

        if (!user) {
            router.push(redirectUrl);
            return;
        }
        
        if (role && user.role !== role) {
            // If a specific role is required and the user doesn't have it, redirect.
            // A simple redirect to a default page based on their actual role.
            router.push(user.role === 'host' ? '/dashboard' : '/discover');
        }
    }, [user, loading, router, redirectUrl, role]);

    return { user, loading };
}
