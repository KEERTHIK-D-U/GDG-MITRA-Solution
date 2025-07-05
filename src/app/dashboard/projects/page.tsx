
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { PlusCircle, Inbox, GitBranch } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createProject, getProjectsByHost, type Project } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  tags: z.string().min(1, "Please add at least one tag."),
  imageUrl: z.string().url("Please enter a valid image URL.").or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageProjectsPage() {
    useRequireAuth('host');
    const { user } = useAuth();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", tags: "", imageUrl: "" },
    });

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = getProjectsByHost(user.uid, (hostedProjects) => {
            setProjects(hostedProjects);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const onSubmit = async (data: FormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a project." });
            return;
        }
        setIsSubmitting(true);
        try {
            await createProject({
                ...data,
                tags: data.tags.split(',').map(tag => tag.trim()),
                imageUrl: data.imageUrl || `https://placehold.co/400x225.png`,
                hostId: user.uid,
                hostName: user.name || "Anonymous Host",
            });
            toast({ title: "Project Created!", description: `"${data.title}" has been successfully published.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Create Project", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Projects</h1>
            <Button asChild>
                <a href="#add-project-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
                </a>
            </Button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden flex flex-col">
                        <CardHeader className="p-0">
                            <Image src={project.imageUrl} alt={project.title} width={400} height={225} className="w-full h-40 object-cover" />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-xl mb-2 font-headline">{project.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                         <CardFooter className="p-4 bg-secondary/30">
                            <p className="text-xs text-muted-foreground">Hosted by: {project.hostName}</p>
                        </CardFooter>
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
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
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
                             <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>Cover Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/400x225.png" {...field} /></FormControl><FormMessage /></FormItem>
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
  );
}
