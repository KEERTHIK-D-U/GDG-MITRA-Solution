
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { PlusCircle, Inbox, Calendar, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createEvent, getEventsByHost, type Event } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  location: z.string().min(3, "Location is required."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date." }),
  imageUrl: z.string().url("Please enter a valid image URL.").or(z.literal('')).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ManageEventsPage() {
    useRequireAuth('host');
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", location: "", date: "", imageUrl: "" },
    });

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = getEventsByHost(user.uid, (hostedEvents) => {
            setEvents(hostedEvents);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const onSubmit = async (data: FormValues) => {
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
            return;
        }
        setIsSubmitting(true);
        try {
            await createEvent({
                ...data,
                imageUrl: data.imageUrl || `https://placehold.co/400x250.png`,
                hostId: user.uid,
                hostName: user.name || "Anonymous Host",
            });
            toast({ title: "Event Created!", description: `"${data.title}" has been successfully published.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Create Event", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Events</h1>
            <Button asChild>
                <a href="#add-event-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
                </a>
            </Button>
        </div>

        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
        ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden flex flex-col">
                        <CardHeader className="p-0">
                            <Image src={event.imageUrl} alt={event.title} width={400} height={250} className="w-full h-40 object-cover" />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-xl mb-2 font-headline">{event.title}</CardTitle>
                             <div className="text-muted-foreground space-y-2 text-sm">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 bg-secondary/30">
                            <p className="text-xs text-muted-foreground">Event ID: {event.id}</p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Events Created Yet</h3>
                <p className="mt-2 text-muted-foreground">Click "Add New Event" to get started.</p>
            </div>
        )}

        <div id="add-event-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle>Create a New Event</CardTitle>
                    <CardDescription>Fill out the details below to post a new volunteering event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Coastal Cleanup Drive" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Panambur Beach" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the event, what volunteers will do, etc." {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                                <FormItem><FormLabel>Cover Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://placehold.co/400x250.png" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Event"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
