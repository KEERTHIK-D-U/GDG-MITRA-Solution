"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { hackathons, type Hackathon } from "@/lib/mock-data";
import { ArrowRight, Calendar, Inbox } from "lucide-react";
import { useRequireAuth } from "@/context/auth-context";
import { HackathonRegistrationDialog } from "@/components/hackathon-registration-dialog";

export default function HackathonsPage() {
  useRequireAuth();
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  const handleRegisterClick = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
  };

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col items-start space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Hackathons
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Challenge yourself, build innovative projects, and win amazing prizes.
            </p>
          </div>

          {hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hackathons.map((hackathon) => (
                <Card key={hackathon.id} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30">
                  <CardHeader className="p-0">
                    <Image
                      src={hackathon.imageUrl}
                      alt={hackathon.title}
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover rounded-t-lg"
                      data-ai-hint="hackathon code"
                    />
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <CardTitle className="text-2xl mb-2 font-headline">{hackathon.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{hackathon.dates}</span>
                    </div>
                    <p className="text-muted-foreground">{hackathon.description}</p>
                  </CardContent>
                  <CardFooter className="p-6 bg-secondary/30 rounded-b-lg">
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleRegisterClick(hackathon)}
                    >
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
              <Inbox className="w-16 h-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">No Hackathons Found</h3>
              <p className="mt-2 text-muted-foreground">
                There are no hackathons scheduled at the moment. Stay tuned!
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
          }
        }}
      />
    </>
  );
}
