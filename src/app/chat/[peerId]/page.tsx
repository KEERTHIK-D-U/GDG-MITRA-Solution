
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { type UserProfile, type ChatMessage, sendMessage, getMessages, getUserProfile } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Send, User as UserIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function getChatRoomId(user1Id: string, user2Id: string): string {
    if (!user1Id || !user2Id) return '';
    return [user1Id, user2Id].sort().join('_');
}

export default function ChatPage() {
    useRequireAuth();
    const { user: currentUser } = useAuth();
    const params = useParams();
    const peerId = params.peerId as string;
    const { toast } = useToast();

    const [peerProfile, setPeerProfile] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!currentUser || !peerId) return;

        setLoading(true);
        const id = getChatRoomId(currentUser.uid, peerId);
        setChatRoomId(id);

        getUserProfile(peerId).then(profile => {
            setPeerProfile(profile);
        }).catch(error => {
            console.error("Failed to load peer profile:", error);
            toast({
                variant: "destructive",
                title: "Failed to load user",
                description: error.message,
            });
        });

        const unsubscribe = getMessages(id, (newMessages) => {
            setMessages(newMessages);
            if (loading) setLoading(false);
        },
        (error) => {
            console.error("Message stream error:", error);
            toast({
                variant: "destructive",
                title: "Could not load chat",
                description: error.message,
            });
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUser, peerId, loading, toast]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !chatRoomId) return;
        
        try {
            await sendMessage(chatRoomId, currentUser.uid, newMessage);
            setNewMessage("");
        } catch (error: any) {
            console.error("Failed to send message:", error);
            toast({
                variant: "destructive",
                title: "Failed to send message",
                description: error.message,
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 h-[calc(100vh-8rem)] flex flex-col">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="flex-grow w-full" />
                <Skeleton className="h-12 w-full mt-4" />
            </div>
        );
    }
    
    if (!peerProfile) {
         return (
            <div className="container mx-auto p-4 text-center">
                <p>Could not find user.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 flex justify-center">
            <Card className="w-full max-w-2xl h-[calc(100vh-8rem)] flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 border-b">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{peerProfile.name ? peerProfile.name.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold">{peerProfile.name}</h2>
                        <p className="text-sm text-muted-foreground">{peerProfile.email}</p>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 flex items-start gap-3 text-sm">
                        <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0"/>
                        <div>
                            <p className="font-semibold">Heads up!</p>
                            <p>Messages are temporary and will be deleted after 24 hours. No chat history is saved permanently.</p>
                        </div>
                    </div>
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser?.uid ? "justify-end" : "justify-start")}>
                           {msg.senderId !== currentUser?.uid && (
                               <Avatar className="h-8 w-8">
                                    <AvatarFallback>{peerProfile.name.charAt(0).toUpperCase()}</AvatarFallback>
                               </Avatar>
                           )}
                           <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId === currentUser?.uid ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                                <p className="text-sm">{msg.text}</p>
                           </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4"/>
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
