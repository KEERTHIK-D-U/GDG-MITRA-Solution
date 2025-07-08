
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Inbox, CheckCircle, AlertTriangle } from "lucide-react";
import { getEvents, type Event, getUserRegistrations } from "@/lib/firebase";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { EventRegistrationDialog } from "@/components/event-registration-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function DiscoverPage() {
  useRequireAuth(); // Protect this route for any logged-in user
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for authentication to complete before fetching data
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      setRegistrationsLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = getEvents(
      (fetchedEvents) => {
        setError(null);
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
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

    setRegistrationsLoading(true);
    getUserRegistrations(user.uid).then((regs) => {
        const eventIds = new Set(regs.map(r => r.eventId));
        setUserRegistrations(eventIds);
    }).catch(console.error)
      .finally(() => {
        setRegistrationsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, authLoading, toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = events.filter((event) => {
      return (
        event.title.toLowerCase().includes(lowercasedFilter) ||
        event.description.toLowerCase().includes(lowercasedFilter) ||
        event.location.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);


  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const isLoading = authLoading || loading || registrationsLoading;

  return (
    <>
      <div className="w-full bg-background text-foreground">
        <section className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Discover Opportunities
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
              Find volunteering events and open-source projects happening in your community.
            </p>
            <div className="w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for events by title, location, or keyword..."
                  className="w-full pl-10 pr-4 py-3 text-base rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight mb-8 font-headline">Upcoming Events</h2>
          {error ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg border-destructive/50">
                <AlertTriangle className="w-16 h-16 text-destructive" />
                <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
                <p className="mt-2 text-muted-foreground">{error}</p>
              </div>
          ) : isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
             </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => {
                const isRegistered = userRegistrations.has(event.id);
                const isHost = user?.uid === event.hostId;
                return (
                  <Card key={event.id} className="overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 hover:shadow-primary/20 dark:hover:shadow-primary/20">
                    <CardHeader className="p-4 flex-grow">
                      <h3 className="text-xl mb-2 font-semibold">{event.title}</h3>
                      <div className="text-muted-foreground space-y-2">
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
                     <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 bg-secondary/30">
                      <Button 
                        className="w-full" 
                        variant={isRegistered ? "secondary" : "outline"}
                        onClick={() => !isRegistered && handleRegisterClick(event)}
                        disabled={isRegistered || isHost}
                      >
                        {isHost ? (
                          "You are the host"
                        ) : isRegistered ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Registered
                          </>
                        ) : (
                          "View & Register"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
              <Inbox className="w-16 h-16 text-muted-foreground" />
               <h3 className="mt-4 text-xl font-semibold">
                {searchTerm ? "No Matching Events Found" : "No Events Found"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm
                  ? "Try searching for something else."
                  : "There are no upcoming events at the moment. Check back later or ask a host to create one!"}
              </p>
            </div>
          )}
        </section>
      </div>
      <EventRegistrationDialog 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedEvent(null);
             // Refetch registrations when dialog closes to update status
            if (user) {
              setRegistrationsLoading(true);
              getUserRegistrations(user.uid).then((regs) => {
                  const eventIds = new Set(regs.map(r => r.eventId));
                  setUserRegistrations(eventIds);
              }).finally(() => {
                  setRegistrationsLoading(false);
              });
            }
          }
        }}
      />
    </>
  );
}
