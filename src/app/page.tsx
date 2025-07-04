import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full bg-background text-foreground">
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Community members volunteering"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-40"
          data-ai-hint="community volunteering"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
        <div className="relative z-20 container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter !leading-tight font-headline">
              Connect, Collaborate, Contribute.
            </h1>
            <p className="max-w-3xl text-lg md:text-xl text-primary-foreground/90">
              Mitra is the bridge between passionate volunteers and impactful opportunities in Mangalore. Discover local events, contribute to open-source projects, and be the change your community needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/discover">
                  Find Opportunities <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">
                  Become a Host
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
                <p className="text-muted-foreground mt-2">Joining our community is as easy as 1-2-3.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-2 font-headline">1. Discover</h3>
                    <p className="text-muted-foreground">Browse a curated list of volunteering events, hackathons, and open-source projects tailored for our local community.</p>
                </div>
                <div className="p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-2 font-headline">2. Engage</h3>
                    <p className="text-muted-foreground">Sign up for events, register for hackathons, or start contributing to projects that match your skills and passion.</p>
                </div>
                 <div className="p-6 rounded-lg">
                    <h3 className="text-2xl font-semibold mb-2 font-headline">3. Impact</h3>
                    <p className="text-muted-foreground">Make a real difference, earn badges for your contributions, and build a strong profile showcasing your commitment.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
