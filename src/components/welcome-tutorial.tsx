
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, User, Compass, Code, Users, LayoutDashboard, Rocket } from "lucide-react";
import type { UserProfile } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface WelcomeTutorialProps {
    user: UserProfile;
    isOpen: boolean;
    onFinish: () => void;
}

const volunteerSteps = [
    {
        icon: Rocket,
        title: "Welcome to Mitra!",
        description: "Let's take a quick tour to see how you can start making an impact in the community.",
    },
    {
        icon: Compass,
        title: "Discover Opportunities",
        description: "The 'Discover' page is your hub for finding local volunteering events. You can view details and register with just a click.",
    },
    {
        icon: Code,
        title: "Explore Hackathons & Projects",
        description: "Check out the 'Hackathons' and 'Projects' pages to find coding challenges and open-source initiatives where you can contribute your skills.",
    },
    {
        icon: Users,
        title: "Connect with Members",
        description: "Visit the 'Connections' page to find other volunteers and hosts. It's a great way to network and collaborate.",
    },
    {
        icon: User,
        title: "Complete Your Profile",
        description: "Your journey begins now! We recommend heading to your profile to upload a picture and share a bit about yourself. A complete profile helps you connect with others.",
    },
];

const hostSteps = [
    {
        icon: Rocket,
        title: "Welcome, Host!",
        description: "Let's take a quick tour of your dashboard and see how you can start organizing opportunities.",
    },
    {
        icon: LayoutDashboard,
        title: "Your Dashboard",
        description: "This is your command center. Here you can create and manage events, projects, and hackathons for the community.",
    },
    {
        icon: Users,
        title: "Connect with Members",
        description: "Visit the 'Connections' page to find volunteers and other hosts. It's a great way to build your team and network.",
    },
    {
        icon: User,
        title: "Complete Your Profile",
        description: "Your journey begins now! We recommend heading to your profile to upload a picture and share a bit about your organization. This builds trust with volunteers.",
    },
];

export function WelcomeTutorial({ user, isOpen, onFinish }: WelcomeTutorialProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const steps = user.role === 'host' ? hostSteps : volunteerSteps;
    const isLastStep = step === steps.length - 1;

    const handleNext = () => {
        if (!isLastStep) {
            setStep(s => s + 1);
        } else {
            onFinish();
            router.push('/profile');
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    };

    const handleSkip = () => {
        onFinish();
    };

    const CurrentIcon = steps[step].icon;

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="items-center text-center">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                        <CurrentIcon className="w-10 h-10" />
                    </div>
                    <DialogTitle className="text-2xl">{steps[step].title}</DialogTitle>
                    <DialogDescription>
                        {steps[step].description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                    <div className="flex justify-between items-center w-full">
                        <Button variant="ghost" onClick={handleSkip}>Skip Tour</Button>
                        <div className="flex gap-2">
                            {step > 0 && <Button variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2" /> Previous</Button>}
                            <Button onClick={handleNext}>
                                {isLastStep ? "Go to Profile" : "Next"} <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                     <div className="flex justify-center items-center mt-4">
                        {steps.map((_, index) => (
                            <div key={index} className={`h-2 w-2 rounded-full mx-1 ${step === index ? 'bg-primary' : 'bg-muted'}`}></div>
                        ))}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
