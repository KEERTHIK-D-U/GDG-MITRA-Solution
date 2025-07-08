
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { PlusCircle, Inbox, GitBranch, Trash2, Upload, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createProject, getProjectsByHost, type Project, deleteProject, uploadImage, getContributionsForProject, type ProjectContribution } from "@/lib/firebase";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  tags: z.string().min(1, "Please add at least one tag."),
  image: z
    .any()
    .refine((files) => !files || files.length === 0 || (files[0] && files[0].size <= 4 * 1024 * 1024), {
      message: "Max image size is 4MB.",
    })
    .refine((files) => !files || files.length === 0 || (files[0] && ACCEPTED_IMAGE_TYPES.includes(files[0].type)), {
      message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ContributionsList = ({ projectId }: { projectId: string }) => {
    const [contributions, setContributions] = useState<ProjectContribution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getContributionsForProject(projectId, (data) => {
            setContributions(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [projectId]);

    if (loading) {
        return <Skeleton className="h-24 w-full" />;
    }

    if (contributions.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No interested contributors yet.</p>;
    }
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contributions.map(reg => (
                    <TableRow key={reg.id}>
                        <TableCell>{reg.userName}</TableCell>
                        <TableCell>{reg.userEmail}</TableCell>
                        <TableCell className="text-right">{format(reg.contributedAt.toDate(), "PPP")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
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

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", tags: "" },
    });
    const imageRef = form.register("image");

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
        if (!user || !user.email) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a project." });
            return;
        }
        setIsSubmitting(true);
        try {
            let imageUrl = `https://placehold.co/600x400.png`;
             if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }

            await createProject({
                title: data.title,
                description: data.description,
                tags: data.tags.split(',').map(tag => tag.trim()),
                imageUrl: imageUrl,
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

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        ) : projects.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
                {projects.map((project) => (
                     <AccordionItem value={project.id} key={project.id} className="border-b-0">
                        <Card className="overflow-hidden flex flex-col">
                            <AccordionTrigger className="hover:no-underline p-0 text-left w-full">
                                <div className="w-full">
                                    <CardHeader className="p-0">
                                        <Image src={project.imageUrl} alt={project.title} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint="code project" />
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <CardTitle className="text-xl mb-2 font-headline">{project.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary">{tag}</Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 bg-secondary/30 flex items-center justify-between">
                                        <div className="flex items-center text-sm font-medium text-primary">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span>View Contributors</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => {e.stopPropagation(); setProjectToDelete(project);}}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete project</span>
                                        </Button>
                                    </CardFooter>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-6 border-t">
                                    <h3 className="text-lg font-semibold mb-4">Interested Contributors</h3>
                                    <ContributionsList projectId={project.id} />
                                </div>
                            </AccordionContent>
                        </Card>
                    </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Projects Created Yet</h3>
                <p className="mt-2 text-muted-foreground">Click "Add New Project" to get started.</p>
            </div>
        )}

        <div id="add-project-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
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
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cover Image (Optional)</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                          <Input type="file" accept="image/*" className="pl-10" {...imageRef} />
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
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
