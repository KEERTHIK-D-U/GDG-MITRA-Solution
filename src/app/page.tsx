
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-background text-foreground">
      <section className="h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-primary-foreground dark:text-primary bg-gradient-to-br from-primary to-slate-900 dark:from-slate-300 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter !leading-tight font-headline">
              Connect, Collaborate, Contribute.
            </h1>
            <p className="max-w-3xl text-lg md:text-xl text-primary-foreground/90 dark:text-primary/90 font-subheading">
              Mitra is the bridge between passionate community members and impactful opportunities. Discover local events, contribute to open-source projects, and be the change your community needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Join the Community
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

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-x-2">
                    What <Logo /> Stands For
                </h2>
                <p className="text-muted-foreground mt-2 font-subheading">Our name reflects our mission to build a thriving community.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">M</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Meet & Mentor</h4>
                    <p className="text-muted-foreground">Connect with peers and experienced professionals in the community.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">I</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Ignite Innovation</h4>
                    <p className="text-muted-foreground">Participate in hackathons and build groundbreaking projects.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">T</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Tackle Challenges</h4>
                    <p className="text-muted-foreground">Join forces with others to solve real-world problems through volunteering.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">R</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Reinforce Skills</h4>
                    <p className="text-muted-foreground">Gain practical experience by contributing to open-source projects.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">A</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Activate Community</h4>
                    <p className="text-muted-foreground">Be an active part of the tech and social impact scene.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
