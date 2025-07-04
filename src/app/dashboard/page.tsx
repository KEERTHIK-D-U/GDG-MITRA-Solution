import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, GitBranch } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Placeholder data - in a real app, this would come from a database
  const hostedEventsCount = 0;
  const hostedProjectsCount = 0;

  return (
    <div className="bg-secondary/50 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Host Dashboard
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Manage your events and open source projects.
            </p>
          </div>
          <div className="flex gap-2">
             <Button asChild>
                <Link href="/dashboard/events">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                </Link>
             </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/projects">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Link>
             </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
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
            <Card>
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
        </div>

        <div className="mt-12">
            <Link href="/dashboard/events">
                <Button variant="link" className="p-0 h-auto text-lg">Manage Events &rarr;</Button>
            </Link>
        </div>
         <div className="mt-4">
            <Link href="/dashboard/projects">
                <Button variant="link" className="p-0 h-auto text-lg">Manage Projects &rarr;</Button>
            </Link>
        </div>

      </div>
    </div>
  );
}
