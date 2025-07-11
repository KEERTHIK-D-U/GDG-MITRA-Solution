
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Inbox, GitBranch, Trash2, Users, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createProject, getProjectsByHost, type Project, deleteProject, getContributionsForProject } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  tags: z.string().min(1, "Please add at least one tag."),
});

type FormValues = z.infer<typeof formSchema>;

const ContributionCount = ({ projectId }: { projectId: string }) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getContributionsForProject(
            projectId,
            (data) => {
                setCount(data.length);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                toast({
                    variant: "destructive",
                    title: "Failed to load contributors",
                    description: err.message,
                });
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [projectId, toast]);

    return (
         <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center text-lg"><Users className="w-5 h-5 mr-2 text-primary" /> Interested Contributors</h4>
            {loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{count}</p>}
        </div>
    );
};

export default function ManageProjectsPage() {
    useRequireAuth('host');
    const { user } = useAuth();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", tags: "" },
    });

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = getProjectsByHost(
            user.uid,
            (hostedProjects) => {
                setError(null);
                setProjects(hostedProjects);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err.message);
                toast({
                    variant: "destructive",
                    title: "Failed to load projects",
                    description: err.message,
                });
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [user, toast]);

    const onSubmit = async (data: FormValues) => {
        if (!user || !user.email) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a project." });
            return;
        }
        setIsSubmitting(true);
        try {
            await createProject({
                title: data.title,
                description: data.description,
                tags: data.tags.split(',').map(tag => tag.trim()),
                hostId: user.uid,
                hostName: user.name || "Anonymous Host",
                hostEmail: user.email,
            });
            toast({ title: "Project Created!", description: `"${data.title}" has been successfully published.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Create Project", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProject(projectToDelete.id);
            toast({ title: "Project Removed", description: `"${projectToDelete.title}" has been successfully removed.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Remove Project", description: error.message });
        } finally {
            setProjectToDelete(null);
        }
    };

  return (
    <>
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Projects</h1>
            <Button asChild>
                <a href="#add-project-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                </a>
            </Button>
        </div>

        {error ? (
             <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg border-destructive/50">
                <AlertTriangle className="w-16 h-16 text-destructive" />
                <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <p className="mt-2 text-sm text-muted-foreground">This is often caused by Firestore security rules or missing database indexes. Check your browser's developer console for more details.</p>
            </div>
        ) : loading ? (
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        ) : projects.length > 0 ? (
            <div className="space-y-6">
                {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 hover:shadow-primary/20 dark:hover:shadow-primary/20">
                        <CardHeader className="p-6">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-xl font-headline font-semibold">{project.title}</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive hover:bg-destructive/10" onClick={() => setProjectToDelete(project)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete project</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <div className="border-t bg-secondary/30 p-4">
                           <ContributionCount projectId={project.id} />
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Projects Created Yet</h3>
                <p className="mt-2 text-muted-foreground">Click "Add New Project" to get started.</p>
            </div>
        )}

        <div id="add-project-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 hover:shadow-primary/20 dark:hover:shadow-primary/20">
                <CardHeader>
                    <CardTitle>Create a New Project</CardTitle>
                    <CardDescription>Fill out the details below to list your open source project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="e.g., CommunityConnect App" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the project, its goals, and what contributors can do." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="tags" render={({ field }) => (
                                <FormItem><FormLabel>Tags / Tech Stack</FormLabel><FormControl><Input placeholder="e.g., React, Next.js, Firebase" {...field} /></FormControl><p className="text-sm text-muted-foreground">Comma-separated list of technologies.</p><FormMessage /></FormItem>
                            )} />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Project"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
     <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this project from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
            Yes, delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
