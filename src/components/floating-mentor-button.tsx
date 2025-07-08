
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
                className="rounded-full h-14 w-14 bg-background/80 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-[0_0_20px_2px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_5px_hsl(var(--primary)/0.3)]"
                onClick={() => setIsOpen(true)}
            >
                <Bot className="h-7 w-7 text-primary" />
                <span className="sr-only">Open AI Mentor</span>
            </Button>

            <AiMentorDialog isOpen={isOpen} onOpenChange={setIsOpen} />
        </>
    )
}
