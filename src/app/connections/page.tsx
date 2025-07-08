
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { type UserProfile, getUsers } from "@/lib/firebase";
import { School, Mail, GraduationCap, Users, User as UserIcon, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const unsubscribe = getUsers(currentUser.uid, 
            (fetchedUsers) => {
                setError(null);
                setUsers(fetchedUsers);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err.message);
                toast({
                    variant: "destructive",
                    title: "Failed to load connections",
                    description: err.message,
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser, toast]);

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex flex-col items-start space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
                    Community Connections
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
                    Discover and connect with other users in the Mitra community.
                </p>
            </div>
            {error ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg border-destructive/50">
                    <AlertTriangle className="w-16 h-16 text-destructive" />
                    <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
                    <p className="mt-2 text-muted-foreground">{error}</p>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {Array.from({ length: 8 }).map((_, i) => <UserCardSkeleton key={i} />)}
                </div>
            ) : users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {users.map((user) => (
                        <Card key={user.uid} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 hover:shadow-primary/20 dark:hover:shadow-primary/20">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : <UserIcon />}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{user.name || 'Community Member'}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                        {currentUser?.college && user.college && currentUser.college.trim().toLowerCase() === user.college.trim().toLowerCase() && (
                                            <Badge variant="outline" className="capitalize border-primary text-primary"><GraduationCap className="w-3 h-3 mr-1"/>Alumni</Badge>
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
                                    <a href={`mailto:${user.email}`}>
                                        <Mail className="mr-2 h-4 w-4" /> Contact
                                    </a>
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
