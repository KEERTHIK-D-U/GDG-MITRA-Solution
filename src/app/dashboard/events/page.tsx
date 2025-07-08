
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { PlusCircle, Inbox, Calendar, MapPin, Trash2, Upload, Users, Mail, UserCheck, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createEvent, getEventsByHost, type Event, deleteEvent, uploadImage, getRegistrationsForEvent, type EventRegistration } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { format } from "date-fns";


const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
  location: z.string().min(3, "Location is required."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid date." }),
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

const RegistrationsList = ({ eventId }: { eventId: string }) => {
    const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = getRegistrationsForEvent(
            eventId, 
            (data) => {
                setError(null);
                setRegistrations(data);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err.message);
                toast({
                    variant: "destructive",
                    title: "Failed to load registrations",
                    description: err.message,
                });
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [eventId, toast]);

    if (loading) {
        return <Skeleton className="h-24 w-full" />;
    }

    if (error) {
        return <p className="text-sm text-destructive text-center py-4">{error}</p>
    }

    if (registrations.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No registrations yet.</p>;
    }
    
    const participants = registrations.filter(r => r.registrationType === 'participant');
    const volunteers = registrations.filter(r => r.registrationType === 'volunteer');

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold mb-2 flex items-center"><UserCheck className="w-5 h-5 mr-2 text-primary" /> Participants ({participants.length})</h4>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Registered On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length > 0 ? participants.map(reg => (
                            <TableRow key={reg.id}>
                                <TableCell>{reg.userName}</TableCell>
                                <TableCell>{reg.userEmail}</TableCell>
                                <TableCell className="text-right">{format(reg.registeredAt.toDate(), "PPP")}</TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={3} className="text-center">No participants.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
             <div>
                <h4 className="font-semibold mb-2 flex items-center"><UserCheck className="w-5 h-5 mr-2 text-secondary-foreground" /> Volunteers ({volunteers.length})</h4>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Registered On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {volunteers.length > 0 ? volunteers.map(reg => (
                            <TableRow key={reg.id}>
                                <TableCell>{reg.userName}</TableCell>
                                <TableCell>{reg.userEmail}</TableCell>
                                <TableCell className="text-right">{format(reg.registeredAt.toDate(), "PPP")}</TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={3} className="text-center">No volunteers.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};


export default function ManageEventsPage() {
    useRequireAuth();
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: "", description: "", location: "", date: "" },
    });
     const imageRef = form.register("image");

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = getEventsByHost(
            user.uid, 
            (hostedEvents) => {
                setError(null);
                setEvents(hostedEvents);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setError(err.message);
                toast({
                    variant: "destructive",
                    title: "Failed to load events",
                    description: err.message,
                });
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [user, toast]);

    const onSubmit = async (data: FormValues) => {
        if (!user || !user.email) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
            return;
        }
        setIsSubmitting(true);
        try {
            let imageUrl = `https://placehold.co/600x400.png`;
            if (data.image && data.image.length > 0) {
                imageUrl = await uploadImage(data.image[0]);
            }

            await createEvent({
                title: data.title,
                description: data.description,
                location: data.location,
                date: data.date,
                imageUrl: imageUrl,
                hostId: user.uid,
                hostName: user.name || "Anonymous Host",
                hostEmail: user.email,
            });
            toast({ title: "Event Created!", description: `"${data.title}" has been successfully published.` });
            form.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Create Event", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            await deleteEvent(eventToDelete.id);
            toast({ title: "Event Removed", description: `"${eventToDelete.title}" has been successfully removed.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to Remove Event", description: error.message });
        } finally {
            setEventToDelete(null);
        }
    };

  return (
    <>
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Your Events</h1>
            <Button asChild>
                <a href="#add-event-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
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
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
        ) : events.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
                {events.map((event) => (
                   <AccordionItem value={event.id} key={event.id} className="border-b-0">
                     <Card className="overflow-hidden">
                        <div className="flex w-full items-stretch">
                          <AccordionTrigger className="p-0 hover:no-underline w-full text-left flex-grow">
                            <div className="flex flex-col md:flex-row w-full h-full">
                              <div className="md:w-1/3">
                                <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="w-full h-48 md:h-full object-cover" data-ai-hint="event community" />
                              </div>
                              <div className="md:w-2/3 flex flex-col">
                                <CardHeader className="flex-grow">
                                    <h3 className="text-xl font-headline font-semibold">{event.title}</h3>
                                    <div className="text-muted-foreground space-y-2 text-sm pt-2">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardFooter className="p-4 bg-secondary/30 mt-auto">
                                    <div className="flex items-center text-sm font-medium text-primary">
                                        <Users className="w-4 h-4 mr-2" />
                                        <span>View Registrations</span>
                                    </div>
                                </CardFooter>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <div className="flex items-center p-4 border-l bg-secondary/30">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setEventToDelete(event)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete event</span>
                            </Button>
                          </div>
                        </div>
                       <AccordionContent>
                         <div className="p-6 border-t">
                            <h3 className="text-lg font-semibold mb-4">Registrations</h3>
                            <RegistrationsList eventId={event.id} />
                         </div>
                       </AccordionContent>
                      </Card>
                   </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Events Created Yet</h3>
                <p className="mt-2 text-muted-foreground">Click "Add New Event" to get started.</p>
            </div>
        )}

        <div id="add-event-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
                <CardHeader>
                    <CardTitle>Create a New Event</CardTitle>
                    <CardDescription>Fill out the details below to post a new event.</CardDescription>
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
                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Marina Beach" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the event, what volunteers will do, etc." {...field} /></FormControl><FormMessage /></FormItem>
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
                                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Publishing..." : "Publish Event"}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>

    <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this event from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive hover:bg-destructive/90">
            Yes, delete event
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
