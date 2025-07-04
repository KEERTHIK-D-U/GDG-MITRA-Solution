"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Inbox } from "lucide-react";
import { useRequireAuth } from "@/context/auth-context";


export default function ManageProjectsPage() {
    useRequireAuth('host');
    const projects: any[] = []; // Placeholder

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Projects</h1>
            <Button asChild>
                <a href="#add-project-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                </a>
            </Button>
        </div>

        {projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {/* List of projects would go here */}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Projects Created Yet</h3>
                <p className="mt-2 text-muted-foreground">
                Click "Add New Project" to get started.
                </p>
            </div>
        )}

        <div id="add-project-form" className="pt-16">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a New Project</CardTitle>
                    <CardDescription>Fill out the details below to list your open source project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="project-title">Project Title</Label>
                            <Input id="project-title" placeholder="e.g., CommunityConnect App" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-description">Description</Label>
                            <Textarea id="project-description" placeholder="Describe the project, its goals, and what contributors can do." />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="project-tags">Tags / Tech Stack</Label>
                            <Input id="project-tags" placeholder="e.g., React, Next.js, Firebase" />
                            <p className="text-sm text-muted-foreground">Comma-separated list of technologies.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-image">Cover Image</Label>
                            <Input id="project-image" type="file" />
                            <p className="text-sm text-muted-foreground">Upload a logo or banner for your project.</p>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Publish Project</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}