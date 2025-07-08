
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askMentor, type MentorChatInput } from "@/ai/flows/mentor-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTheme } from "next-themes";

type Message = {
    role: 'user' | 'model';
    text: string;
};

interface AiMentorDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function AiMentorDialog({ isOpen, onOpenChange }: AiMentorDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    // Effect to set the initial message once the dialog is opened and the user is available.
    useEffect(() => {
        if (isOpen && user && messages.length === 0) {
            setMessages([
                {
                    role: 'model',
                    text: `Hello ${user.name || 'there'}! I'm Mitra AI, your personal mentor. How can I help you today? You can ask me about our platform, programming concepts, or anything else related to your tech journey.`
                }
            ]);
        } else if (!isOpen) {
            // Optional: Reset chat when dialog closes
            // setMessages([]);
        }
    }, [isOpen, user, messages.length]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
            const payload: MentorChatInput = { history: historyForApi, message: input };
            
            const result = await askMentor(payload);
            const modelMessage: Message = { role: 'model', text: result.response };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error getting response',
                description: error.message || "The AI mentor is currently unavailable. Please try again later."
            });
             setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-2xl h-[80vh] flex flex-col p-0 gap-0",
                theme === 'light' ? 'dark' : 'force-light-theme'
            )}>
                 <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="text-primary" />
                        <span>AI Mentor</span>
                    </DialogTitle>
                    <DialogDescription>Your personal guide for career and skill development.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 flex flex-col gap-4 overflow-hidden p-6">
                     <ScrollArea className="flex-1 pr-4 -mr-6">
                        <div className="space-y-6">
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'model' && (
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("max-w-sm md:max-w-md lg:max-w-lg p-3 rounded-2xl", 
                                        message.role === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                                            : 'bg-muted rounded-bl-none'
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="w-8 h-8 border">
                                            <AvatarFallback>{user?.name?.charAt(0) || <User size={20} />}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                     <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-sm md:max-w-md lg:max-w-lg p-3 rounded-2xl bg-muted rounded-bl-none">
                                        <div className="flex items-center space-x-2">
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </div>
                <div className="p-6 border-t bg-background">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your mentor a question..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4" />
                            <span className="sr-only">Send message</span>
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
