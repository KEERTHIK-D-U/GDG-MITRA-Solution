
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
                className="rounded-full h-14 w-14 shadow-lg bg-background/80 backdrop-blur-sm hover:scale-105 transition-transform"
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-7 w-7 text-primary" />
                <span className="sr-only">Open AI Mentor</span>
            </Button>

            <AiMentorDialog isOpen={isOpen} onOpenChange={setIsOpen} />
        </>
    )
}
