import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Search, MapPin, Calendar } from "lucide-react";
import { events } from "@/lib/mock-data";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-background text-foreground">
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
            Connect with Your Community
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Discover volunteering events and open-source projects happening around Mangalore.
          </p>
          <div className="w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for events, hackathons, or projects..."
                className="w-full pl-10 pr-4 py-2 text-base"
              />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight mb-8 font-headline">Upcoming Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="p-0">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                  data-ai-hint="event community"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl mb-2 font-headline">{event.title}</CardTitle>
                <div className="text-muted-foreground space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button asChild className="w-full" variant="outline">
                  <Link href="#">View & Register</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
