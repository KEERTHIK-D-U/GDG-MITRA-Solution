import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { hackathons } from "@/lib/mock-data";
import { ArrowRight, Calendar } from "lucide-react";

export default function HackathonsPage() {
  return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
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
                <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="#">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
