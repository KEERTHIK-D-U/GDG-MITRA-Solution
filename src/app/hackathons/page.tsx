
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getHackathons, type Hackathon, getUserHackathonRegistrations } from "@/lib/firebase";
import { ArrowRight, Calendar, Inbox, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { HackathonRegistrationDialog } from "@/components/hackathon-registration-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function HackathonsPage() {
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setRegistrationsLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribeHackathons = getHackathons(
      (fetchedHackathons) => {
        setError(null);
        setHackathons(fetchedHackathons);
        setFilteredHackathons(fetchedHackathons);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Failed to load hackathons",
          description: err.message,
        });
        setLoading(false);
      }
    );

    setRegistrationsLoading(true);
    getUserHackathonRegistrations(user.uid).then((regs) => {
        const hackathonIds = new Set(regs.map(r => r.hackathonId));
        setUserRegistrations(hackathonIds);
    }).catch(console.error)
      .finally(() => {
        setRegistrationsLoading(false);
    });

    return () => unsubscribeHackathons();
  }, [user, authLoading, toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = hackathons.filter((hackathon) => {
      return (
        hackathon.title.toLowerCase().includes(lowercasedFilter) ||
        hackathon.description.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredHackathons(filtered);
  }, [searchTerm, hackathons]);

  const handleRegisterClick = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
  };
  
  const isLoading = authLoading || loading || registrationsLoading;

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col items-start space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Hackathons
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
              Challenge yourself, build innovative projects, and win amazing prizes.
            </p>
          </div>
          
           <div className="mb-12 w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for hackathons..."
                  className="w-full pl-10 pr-4 py-3 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
          {error ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg border-destructive/50">
                <AlertTriangle className="w-16 h-16 text-destructive" />
                <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
                <p className="mt-2 text-muted-foreground">{error}</p>
              </div>
          ) : isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
            </div>
          ) : filteredHackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredHackathons.map((hackathon) => {
                const isRegistered = userRegistrations.has(hackathon.id);
                const isHost = user?.uid === hackathon.hostId;
                return (
                  <Card key={hackathon.id} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50 hover:shadow-primary/20 dark:hover:shadow-primary/20">
                    <CardHeader className="p-6 flex-grow">
                      <h3 className="text-2xl mb-2 font-semibold">{hackathon.title}</h3>
                      <div className="flex items-center text-muted-foreground mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{hackathon.dates}</span>
                      </div>
                      <p className="text-muted-foreground">{hackathon.description}</p>
                    </CardHeader>
                    <CardFooter className="p-6 bg-secondary/30 rounded-b-lg mt-auto">
                      <Button 
                        className="w-full"
                        variant={isRegistered ? "secondary" : "default"}
                        onClick={() => !isRegistered && handleRegisterClick(hackathon)}
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
                          <>
                            Register Now <ArrowRight className="ml-2 h-4 w-4" />
                          </>
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
                {searchTerm ? "No Matching Hackathons Found" : "No Hackathons Found"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search."
                  : "There are no hackathons scheduled at the moment. Stay tuned!"}
              </p>
            </div>
          )}
        </div>
      </div>
      <HackathonRegistrationDialog 
        hackathon={selectedHackathon}
        isOpen={!!selectedHackathon}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedHackathon(null);
            // Refetch registrations when dialog closes to update status
            if (user) {
              setRegistrationsLoading(true);
              getUserHackathonRegistrations(user.uid).then((regs) => {
                  const hackathonIds = new Set(regs.map(r => r.hackathonId));
                  setUserRegistrations(hackathonIds);
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
