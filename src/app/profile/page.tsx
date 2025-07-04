"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { userHistory, userBadges } from "@/lib/mock-data";
import { Award, Code, Edit, GitPullRequest, Hand, HeartHandshake, Sprout, User as UserIcon, Users } from "lucide-react";
import * as React from "react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { testFirestoreConnection } from "@/lib/firebase";

const iconMap: { [key: string]: React.ElementType } = {
    Award,
    HeartHandshake,
    Sprout,
    Users,
    Code,
    GitPullRequest,
};

export default function ProfilePage() {
    useRequireAuth(); // Protect this route for any logged in user
    const { user, loading } = useAuth();
    const { toast } = useToast();

    const handleTestConnection = async () => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Not Logged In",
                description: "You must be logged in to test the connection.",
            });
            return;
        }
        try {
            const result = await testFirestoreConnection(user.uid);
            toast({
                title: "Firestore Connection Successful!",
                description: `Successfully updated document for user: ${result.uid}`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Firestore Connection Failed",
                description: error.message,
            });
        }
    };
    
    if (loading || !user) {
        return <div>Loading...</div>; // or a loading skeleton
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
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold font-headline">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="mt-2 max-w-xl text-foreground">
                        Passionate about leveraging technology for community good. Full-stack developer with a love for open source and volunteering.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
                    <TabsTrigger value="history">Volunteer History</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                    <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="history">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30 hover:border-2">
                        <CardHeader>
                            <CardTitle>Volunteer History</CardTitle>
                            <CardDescription>A record of your contributions and impact.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {userHistory.map((item) => (
                                <div key={item.id} className="p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.date} | {item.role}</p>
                                    </div>
                                    <div className="text-sm font-medium text-primary shrink-0">
                                        {item.hours} hours contributed
                                    </div>
                                </div>
                            ))}
                            {userHistory.length === 0 && <p className="text-muted-foreground text-center">No history yet. Start volunteering!</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards">
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30 hover:border-2">
                        <CardHeader>
                            <CardTitle>Badges & Rewards</CardTitle>
                            <CardDescription>Celebrating your milestones and achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {userBadges.map((badge) => {
                                const Icon = iconMap[badge.icon] || Hand;
                                return (
                                <div key={badge.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30 hover:border-2">
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
                    <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30 hover:border-2">
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={user.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" placeholder="Tell us a little bit about yourself" defaultValue="Passionate about leveraging technology for community good. Full-stack developer with a love for open source and volunteering."/>
                            </div>
                            <Button>Save Changes</Button>

                             <div className="pt-6 mt-6 border-t">
                                <h3 className="text-lg font-medium">Developer Tools</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Use this button to verify that the application can successfully write to your user document in Firestore.
                                </p>
                                <Button variant="outline" onClick={handleTestConnection}>Test Firestore Connection</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
