"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Inbox } from "lucide-react";
import { useRequireAuth } from "@/context/auth-context";

export default function ManageEventsPage() {
    useRequireAuth('host');
    const events: any[] = []; // Placeholder

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Events</h1>
            <Button asChild>
                <a href="#add-event-form">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
                </a>
            </Button>
        </div>

        {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
                {/* List of events would go here */}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <Inbox className="w-16 h-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">No Events Created Yet</h3>
                <p className="mt-2 text-muted-foreground">
                Click "Add New Event" to get started.
                </p>
            </div>
        )}


        <div id="add-event-form" className="pt-16">
            <Card className="max-w-3xl mx-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#CFFFDC] hover:shadow-[#CFFFDC]/30">
                <CardHeader>
                    <CardTitle>Create a New Event</CardTitle>
                    <CardDescription>Fill out the details below to post a new volunteering event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="event-title">Event Title</Label>
                            <Input id="event-title" placeholder="e.g., Coastal Cleanup Drive" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="event-date">Date</Label>
                                <Input id="event-date" type="date" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="event-location">Location</Label>
                                <Input id="event-location" placeholder="e.g., Panambur Beach" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="event-description">Description</Label>
                            <Textarea id="event-description" placeholder="Describe the event, what volunteers will do, etc." />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="event-image">Cover Image</Label>
                            <Input id="event-image" type="file" />
                            <p className="text-sm text-muted-foreground">Upload a banner or photo for your event.</p>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">Publish Event</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
