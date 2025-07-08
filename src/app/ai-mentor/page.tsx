
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { askMentor, type MentorChatInput } from "@/ai/flows/mentor-chat-flow";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Message = {
    role: 'user' | 'model';
    text: string;
};

export default function AiMentorPage() {
    useRequireAuth();
    const { user } = useAuth();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: `Hello ${user?.name || 'there'}! I'm Mitra AI, your personal mentor. How can I help you today? You can ask me about programming concepts, career advice, or anything else related to your tech journey.`
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

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
             // Restore user message to input if API fails
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Card className="w-full max-w-3xl h-[70vh] flex flex-col shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="text-primary" />
                        <span>AI Mentor</span>
                    </CardTitle>
                    <CardDescription>Your personal guide for career and skill development.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
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
                        </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
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
                </CardContent>
            </Card>
        </div>
    );
}
