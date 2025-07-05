
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { type UserProfile, getMentors } from "@/lib/firebase";
import { Linkedin, Users, User as UserIcon, School, Mail, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
        <CardContent className="mt-auto flex flex-col items-end gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-24" />
        </CardContent>
    </Card>
)

export default function MentorsPage() {
    useRequireAuth();
    const { user: currentUser } = useAuth();
    const [mentors, setMentors] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setMentors([]);
            setLoading(false);
            return;
        }

        const unsubscribe = getMentors(currentUser.uid, (fetchedMentors) => {
            setMentors(fetchedMentors);
            setLoading(false);
        });

        // Cleanup subscription on unmount or when currentUser changes
        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col items-start space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                    Find a Mentor
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
                    Connect with experienced professionals and alumni from the community.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {Array.from({ length: 8 }).map((_, i) => <UserCardSkeleton key={i} />)}
                </div>
            ) : mentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {mentors.map((user) => (
                        <Card key={user.uid} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{user.name || 'Community Mentor'}</CardTitle>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="default" className="capitalize"><GraduationCap className="w-3 h-3 mr-1"/>Mentor</Badge>
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
                            <CardContent className="mt-auto flex flex-col items-end gap-2">
                                {user.linkedinUrl ? (
                                    <Button asChild>
                                        <Link href={user.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="mr-2 h-4 w-4" /> Connect
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" disabled>
                                        <Linkedin className="mr-2 h-4 w-4" /> Not Available
                                    </Button>
                                )}
                                <a href={`mailto:${user.email}`} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                    <Users className="w-16 h-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Mentors Found</h3>
                    <p className="mt-2 text-muted-foreground">
                        As more users sign up to be mentors, they will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
