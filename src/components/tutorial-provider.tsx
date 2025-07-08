
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/firebase";
import { WelcomeTutorial } from "@/components/welcome-tutorial";
import { usePathname } from "next/navigation";

export function TutorialProvider() {
    const { user, firebaseUser, setUser } = useAuth();
    const { toast } = useToast();
    const pathname = usePathname();

    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        // Don't show on login/signup pages, which aren't part of the main app layout for authed users
        if (pathname === '/login' || pathname === '/signup') {
            setIsTutorialOpen(false); // Ensure it's closed if navigating to these pages
            return;
        }

        // Show the tutorial only if the user is newly created and hasn't completed it.
        // We determine "newly created" by checking if their creation and last sign-in times are very close.
        if (user && firebaseUser && !user.hasCompletedTutorial) {
            const creationTime = new Date(firebaseUser.metadata.creationTime!).getTime();
            const lastSignInTime = new Date(firebaseUser.metadata.lastSignInTime!).getTime();
            
            // Show tutorial only if this is the very first sign-in (within a 5-second tolerance).
            if (Math.abs(lastSignInTime - creationTime) < 5000) {
                 setIsTutorialOpen(true);
            } else {
                setIsTutorialOpen(false);
            }
        } else {
            setIsTutorialOpen(false);
        }
    }, [user, firebaseUser, pathname]);

    const handleFinishTutorial = async () => {
        setIsTutorialOpen(false);
        if (user) {
            try {
                await updateUserProfile(user.uid, { hasCompletedTutorial: true });
                // Update the user in the context to reflect the change immediately
                setUser(prev => prev ? { ...prev, hasCompletedTutorial: true } : null);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: "Could not save tutorial completion status."
                });
            }
        }
    };
    
    // The WelcomeTutorial component handles its own visibility via the `isOpen` prop.
    // We need to ensure a user object is passed.
    if (!user) {
        return null;
    }

    return <WelcomeTutorial user={user} isOpen={isTutorialOpen} onFinish={handleFinishTutorial} />;
}
