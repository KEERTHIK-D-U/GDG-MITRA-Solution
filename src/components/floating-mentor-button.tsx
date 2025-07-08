
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AiMentorDialog } from "@/components/ai-mentor-dialog";

export function FloatingMentorButton() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return null;
    }

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                className="rounded-full h-14 w-14 bg-background/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/40"
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-7 w-7 text-primary" />
                <span className="sr-only">Open AI Mentor</span>
            </Button>

            <AiMentorDialog isOpen={isOpen} onOpenChange={setIsOpen} />
        </>
    )
}
