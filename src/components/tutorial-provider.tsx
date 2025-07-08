
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/firebase";
import { WelcomeTutorial } from "@/components/welcome-tutorial";
import { usePathname } from "next/navigation";

export function TutorialProvider() {
    const { user, setUser } = useAuth();
    const { toast } = useToast();
    const pathname = usePathname();

    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    useEffect(() => {
        // Don't show on login/signup pages, which aren't part of the main app layout for authed users
        if (pathname === '/login' || pathname === '/signup') {
            setIsTutorialOpen(false); // Ensure it's closed if navigating to these pages
            return;
        }

        // Show the tutorial if the user exists and hasn't completed it
        if (user && !user.hasCompletedTutorial) {
            setIsTutorialOpen(true);
        } else {
            setIsTutorialOpen(false);
        }
    }, [user, pathname]);

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
