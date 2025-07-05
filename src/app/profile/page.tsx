
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userBadges } from "@/lib/mock-data";
import { Award, Code, Edit, GitBranch, Hand, HeartHandshake, Linkedin, Sprout, User as UserIcon, Users } from "lucide-react";
import * as React from "react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { updateUserProfile, getUserRegistrations, type EventRegistration, getUserHackathonRegistrations, type HackathonRegistration, getUserProjectContributions, type ProjectContribution, uploadImage } from "@/lib/firebase";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const iconMap: { [key: string]: React.ElementType } = {
    Award,
    HeartHandshake,
    Sprout,
    Users,
    Code,
    GitPullRequest: GitBranch, // Using GitBranch for project contributions
};

type HistoryItem = {
    id: string;
    title: string;
    date: Date;
    type: 'event' | 'hackathon' | 'project';
};

export default function ProfilePage() {
    useRequireAuth(); // Protect this route for any logged in user
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [name, setName] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [techStacks, setTechStacks] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // History state
    const [combinedHistory, setCombinedHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Effect to populate form when user data loads
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setLinkedinUrl(user.linkedinUrl || '');
            setTechStacks(user.techStacks || '');
            setBio(user.bio || '');
        }
    }, [user]);

     // Effect to fetch all histories
    useEffect(() => {
        if (user?.uid) {
            setHistoryLoading(true);

            const fetchAllHistory = async () => {
                try {
                    const [eventRegs, hackathonRegs, projectConts] = await Promise.all([
                        getUserRegistrations(user.uid),
                        getUserHackathonRegistrations(user.uid),
                        getUserProjectContributions(user.uid),
                    ]);

                    const events: HistoryItem[] = eventRegs.map(r => ({
                        id: r.id,
                        title: r.eventTitle,
                        date: r.registeredAt.toDate(),
                        type: 'event'
                    }));

                    const hackathons: HistoryItem[] = hackathonRegs.map(r => ({
                        id: r.id,
                        title: r.hackathonTitle,
                        date: r.registeredAt.toDate(),
                        type: 'hackathon'
                    }));
                    
                    const projects: HistoryItem[] = projectConts.map(r => ({
                        id: r.id,
                        title: r.projectTitle,
                        date: r.contributedAt.toDate(),
                        type: 'project'
                    }));
                    
                    const allHistory = [...events, ...hackathons, ...projects];
                    allHistory.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort descending by date
                    
                    setCombinedHistory(allHistory);

                } catch (err: any) {
                    toast({
                        variant: "destructive",
                        title: "Failed to load history",
                        description: err.message
                    });
                } finally {
                    setHistoryLoading(false);
                }
            };
            
            fetchAllHistory();
        }
    }, [user?.uid, toast]);

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, { name, linkedinUrl, techStacks, bio });
            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully saved."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !user) {
            return;
        }

        const file = event.target.files[0];
        if (file.size > 4 * 1024 * 1024) { // 4MB
            toast({ variant: "destructive", title: "Image too large", description: "Please upload an image smaller than 4MB." });
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast({ variant: "destructive", title: "Invalid file type", description: "Please upload an image file." });
            return;
        }

        setIsUploading(true);
        try {
            const photoURL = await uploadImage(file);
            await updateUserProfile(user.uid, { photoURL });
            toast({ title: "Profile Picture Updated", description: "Your new picture has been saved." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Upload Failed", description: error.message });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading || !user) {
        // You can add a more sophisticated skeleton loader here
        return <div>Loading...</div>; 
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePictureChange} 
                style={{ display: 'none' }}
                accept="image/*" 
            />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                         {isUploading ? (
                            <div className="flex items-center justify-center w-full h-full rounded-full bg-muted/50">
                                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                            </div>
                        ) : (
                            <>
                                <AvatarImage src={user.photoURL} alt={user.name || 'User avatar'} />
                                <AvatarFallback><UserIcon className="w-16 h-16" /></AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Profile Picture</span>
                    </Button>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-4xl font-bold font-headline">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                     {user.linkedinUrl && (
                        <div className="mt-2">
                             <Button variant="link" asChild className="p-0 h-auto">
                                <Link href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="mr-2 h-4 w-4" />
                                    LinkedIn Profile
                                </Link>
                            </Button>
                        </div>
                    )}
                     {user.bio && (
                        <blockquote className="mt-4 text-muted-foreground italic border-l-2 pl-4 font-subheading">
                           {user.bio}
                        </blockquote>
                    )}
                    {user.techStacks && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2 text-lg">Tech Stacks</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.techStacks.split(',').map((stack, index) => (
                                    <Badge key={`${stack.trim()}-${index}`} variant="secondary">{stack.trim()}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
                    <TabsTrigger value="history">Contribution History</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                    <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                        <CardHeader>
                            <CardTitle>Contribution History</CardTitle>
                            <CardDescription>A record of your event registrations, hackathon sign-ups, and project contributions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {historyLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="p-4 rounded-lg border flex justify-between items-center gap-2">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="h-8 w-32" />
                                    </div>
                                ))
                            ) : combinedHistory.length > 0 ? (
                                combinedHistory.map((item) => (
                                    <div key={item.id} className="p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                            <h3 className="font-semibold">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {item.type === 'project' ? 'Contribution recorded on: ' : 'Registered on: '}
                                                {format(item.date, "PPP")}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {item.type === 'event' && <Hand className="mr-2 h-4 w-4 text-green-500" />}
                                            {item.type === 'hackathon' && <Code className="mr-2 h-4 w-4 text-blue-500" />}
                                            {item.type === 'project' && <GitBranch className="mr-2 h-4 w-4 text-purple-500" />}
                                            {item.type} Contribution
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No history yet. Register for an event or contribute to a project to get started!</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                        <CardHeader>
                            <CardTitle>Badges & Rewards</CardTitle>
                            <CardDescription>Celebrating your milestones and achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {userBadges.map((badge) => {
                                const Icon = iconMap[badge.icon] || Hand;
                                return (
                                <div key={badge.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                                    <div className="p-4 rounded-full bg-accent/20 text-accent">
                                        <Icon className="w-8 h-8"/>
                                    </div>
                                    <h3 className="font-semibold text-sm">{badge.name}</h3>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                </div>
                            )})}
                             {userBadges.length === 0 && <p className="text-muted-foreground text-center col-span-full">No badges earned yet.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="profile">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                                <Input id="linkedin" placeholder="https://linkedin.com/in/your-profile" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Your Bio</Label>
                                <Textarea id="bio" placeholder="Tell the community a little about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tech-stacks">Tech Stacks</Label>
                                <Input id="tech-stacks" placeholder="e.g., React, Next.js, Firebase" value={techStacks} onChange={(e) => setTechStacks(e.target.value)} />
                                <p className="text-sm text-muted-foreground">Comma-separated list of your technical skills.</p>
                            </div>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
