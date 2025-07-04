"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRequireAuth } from "@/context/auth-context";
import { Users, CalendarCheck, GitPullRequest } from "lucide-react";

export default function AdminPage() {
  useRequireAuth('admin'); // Protect this route for admins only
  
  // Placeholder data - in a real app, this would be fetched from Firestore
  const totalUsers = 0;
  const eventRegistrations = 0;
  const projectContributions = 0;

  return (
    <div className="bg-secondary/50 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Admin Dashboard
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Oversee application activity and manage users.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Total Users</span>
                        <Users className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Registered users in the system</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Event Registrations</span>
                        <CalendarCheck className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{eventRegistrations}</p>
                    <p className="text-sm text-muted-foreground">Total event sign-ups</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Project Contributions</span>
                        <GitPullRequest className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{projectContributions}</p>
                    <p className="text-sm text-muted-foreground">Contributions to projects</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
