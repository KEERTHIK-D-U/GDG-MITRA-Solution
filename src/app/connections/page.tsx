
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { type UserProfile, db } from "@/lib/firebase";
import { Linkedin, Users, User as UserIcon, School, Mail, GraduationCap, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const UserCardSkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </CardHeader>
        <CardContent className="mt-auto flex justify-end gap-2 p-4">
            <Skeleton className="h-10 w-28" />
        </CardContent>
    </Card>
)

export default function ConnectionsPage() {
    useRequireAuth();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setUsers([]);
            setLoading(false);
            return;
        }

        const usersRef = collection(db, "users");
        // Query for all user roles except admin.
        const q = query(usersRef, where("role", "in", ["volunteer", "host", "mentor"]));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs
                .map(doc => doc.data() as UserProfile)
                // Also filter out the current user from the list
                .filter(user => user.uid !== currentUser.uid);

            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Failed to subscribe to user updates:", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount or when currentUser changes
        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col items-start space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                    Community Connections
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
                    Discover and connect with other volunteers, hosts, and mentors in the Mitra community.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {Array.from({ length: 8 }).map((_, i) => <UserCardSkeleton key={i} />)}
                </div>
            ) : users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map((user) => (
                        <Card key={user.uid} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{user.name || 'Community Member'}</CardTitle>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                        {user.role === 'mentor' && (
                                            <Badge variant="default"><GraduationCap className="w-3 h-3 mr-1"/>Mentor</Badge>
                                        )}
                                        {currentUser?.college && user.college && currentUser.college.trim().toLowerCase() === user.college.trim().toLowerCase() && (
                                            <Badge variant="outline" className="capitalize border-green-500 text-green-500"><GraduationCap className="w-3 h-3 mr-1"/>Alumni</Badge>
                                        )}
                                    </div>
                                    {user.college && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center">
                                            <School className="w-4 h-4 mr-1.5"/>
                                            {user.college}
                                        </p>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto flex items-center justify-end gap-2 p-4 pt-2">
                                <Button asChild>
                                    <Link href={`/chat/${user.uid}`}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                    <Users className="w-16 h-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Other Users Found</h3>
                    <p className="mt-2 text-muted-foreground">
                        As the community grows, other users will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
