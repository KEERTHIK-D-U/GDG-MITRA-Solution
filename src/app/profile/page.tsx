
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
import { useState, useEffect } from "react";
import { updateUserProfile, getUserRegistrations, type EventRegistration, getUserHackathonRegistrations, type HackathonRegistration, getUserProjectContributions, type ProjectContribution } from "@/lib/firebase";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

    // Form state
    const [name, setName] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [techStacks, setTechStacks] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // History state
    const [combinedHistory, setCombinedHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Effect to populate form when user data loads
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setLinkedinUrl(user.linkedinUrl || '');
            setTechStacks(user.techStacks || '');
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
            await updateUserProfile(user.uid, { name, linkedinUrl, techStacks });
            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully saved."
            });
            // Note: The main user display will update on the next page load/login.
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
    
    if (loading || !user) {
        // You can add a more sophisticated skeleton loader here
        return <div>Loading...</div>; 
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-md">
                        <AvatarImage src="https://placehold.co/128x128.png" alt={user.name} />
                        <AvatarFallback><UserIcon className="w-16 h-16" /></AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background">
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
                    <p className="mt-2 max-w-xl text-foreground/80">
                       View and edit your profile details, check your volunteer history, and see your rewards.
                    </p>
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
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
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
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                        <CardHeader>
                            <CardTitle>Badges & Rewards</CardTitle>
                            <CardDescription>Celebrating your milestones and achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {userBadges.map((badge) => {
                                const Icon = iconMap[badge.icon] || Hand;
                                return (
                                <div key={badge.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
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
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
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
