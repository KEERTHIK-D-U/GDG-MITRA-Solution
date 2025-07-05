
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, GitBranch, Trophy } from "lucide-react";
import Link from "next/link";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { getEventsByHost, getProjectsByHost, getHackathonsByHost } from "@/lib/firebase";

export default function DashboardPage() {
  useRequireAuth('host'); // Protect this route for hosts
  const { user } = useAuth();
  
  const [hostedEventsCount, setHostedEventsCount] = useState(0);
  const [hostedProjectsCount, setHostedProjectsCount] = useState(0);
  const [hostedHackathonsCount, setHostedHackathonsCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribeEvents = getEventsByHost(user.uid, (events) => {
      setHostedEventsCount(events.length);
    });

    const unsubscribeProjects = getProjectsByHost(user.uid, (projects) => {
      setHostedProjectsCount(projects.length);
    });

    const unsubscribeHackathons = getHackathonsByHost(user.uid, (hackathons) => {
      setHostedHackathonsCount(hackathons.length);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeProjects();
      unsubscribeHackathons();
    };
  }, [user]);

  return (
    <div className="bg-secondary/50 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Host Dashboard
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
              Manage your events, projects, and hackathons.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
             <Button asChild>
                <Link href="/dashboard/events#add-event-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Link>
             </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/projects#add-project-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Link>
             </Button>
              <Button asChild>
                <Link href="/dashboard/hackathons#add-hackathon-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Hackathon
                </Link>
             </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>My Events</span>
                        <Calendar className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{hostedEventsCount}</p>
                    <p className="text-sm text-muted-foreground">Total events hosted</p>
                </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>My Projects</span>
                        <GitBranch className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{hostedProjectsCount}</p>
                    <p className="text-sm text-muted-foreground">Total projects managed</p>
                </CardContent>
            </Card>
            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>My Hackathons</span>
                        <Trophy className="w-6 h-6 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{hostedHackathonsCount}</p>
                    <p className="text-sm text-muted-foreground">Total hackathons hosted</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            <Link href="/dashboard/events">
                <Button variant="link" className="p-0 h-auto text-lg">Manage Events &rarr;</Button>
            </Link>
            <Link href="/dashboard/projects">
                <Button variant="link" className="p-0 h-auto text-lg">Manage Projects &rarr;</Button>
            </Link>
             <Link href="/dashboard/hackathons">
                <Button variant="link" className="p-0 h-auto text-lg">Manage Hackathons &rarr;</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}
