
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { PlusCircle, Inbox, Calendar, Trash2, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createHackathon, getHackathonsByHost, type Hackathon, deleteHackathon, uploadImage } from "@/lib/firebase";
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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  dates: z.string().min(3, "Dates are required (e.g., July 20-22, 2024)."),
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

export default function ManageHackathonsPage() {
    useRequireAuth('host');
    const { user } = useAuth();
    const { toast } = useToast();
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hackathonToDelete, setHackathonToDelete] = useState<Hackathon | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", dates: "" },
    });
    const imageRef = form.register("image");

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = getHackathonsByHost(user.uid, (hostedHackathons) => {
            setHackathons(hostedHackathons);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const onSubmit = async (data: FormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a hackathon." });
            return;
        }
        setIsSubmitting(true);
        try {
            let imageUrl = `https://placehold.co/600x400.png`;
            if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }

            await createHackathon({
                title: data.title,
                description: data.description,
                dates: data.dates,
                imageUrl: imageUrl,
                hostId: user.uid,
                hostName: user.name || "Anonymous Host",
            });
            toast({ title: "Hackathon Created!", description: `"${data.title}" has been successfully published.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Create Hackathon", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHackathon = async () => {
        if (!hackathonToDelete) return;
        try {
            await deleteHackathon(hackathonToDelete.id);
            toast({ title: "Hackathon Removed", description: `"${hackathonToDelete.title}" has been successfully removed.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Remove Hackathon", description: error.message });
        } finally {
            setHackathonToDelete(null);
        }
    };

  return (
    <>
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Hackathons</h1>
            <Button asChild>
                <a href="#add-hackathon-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Hackathon
                </a>
            </Button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
            </div>
        ) : hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons.map((hackathon) => (
                    <Card key={hackathon.id} className="overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                        <CardHeader className="p-0">
                            <Image src={hackathon.imageUrl} alt={hackathon.title} width={600} height={400} className="w-full h-40 object-cover" data-ai-hint="hackathon code" />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-xl mb-2 font-headline">{hackathon.title}</CardTitle>
                            <div className="flex items-center text-muted-foreground mb-4">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{hackathon.dates}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{hackathon.description}</p>
                        </CardContent>
                         <CardFooter className="p-4 bg-secondary/30 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Hosted by: {hackathon.hostName}</p>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setHackathonToDelete(hackathon)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete hackathon</span>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Hackathons Created Yet</h3>
                <p className="mt-2 text-muted-foreground">Click "Add New Hackathon" to get started.</p>
            </div>
        )}

        <div id="add-hackathon-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle>Create a New Hackathon</CardTitle>
                    <CardDescription>Fill out the details below to list your hackathon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Hackathon Title</FormLabel><FormControl><Input placeholder="e.g., AI for Good Hackathon" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="dates" render={({ field }) => (
                                <FormItem><FormLabel>Dates</FormLabel><FormControl><Input placeholder="e.g., August 1-3, 2024" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the hackathon, its themes, prizes, etc." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cover Image</FormLabel>
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
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Hackathon"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
     <AlertDialog open={!!hackathonToDelete} onOpenChange={(open) => !open && setHackathonToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this hackathon from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setHackathonToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteHackathon} className="bg-destructive hover:bg-destructive/90">
            Yes, delete hackathon
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
