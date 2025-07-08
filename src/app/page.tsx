
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { cn } from "@/lib/utils";

declare const anime: any;

export default function Home() {
  useEffect(() => {
    if (typeof anime === 'undefined') return;

    // Animate hero section text and buttons
    anime.timeline({
      easing: 'easeOutExpo',
    })
    .add({
      targets: '#hero-title, #hero-p, #hero-buttons > *',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(100)
    });
    
    // Animate "What Mitra Stands For" section on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: '.mitra-acronym-card',
                    translateY: [20, 0],
                    opacity: [0, 1],
                    duration: 500,
                    delay: anime.stagger(100, {start: 200}),
                    easing: 'easeOutQuad'
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const target = document.querySelector('#mitra-stands-for-section');
    if (target) {
        observer.observe(target);
    }

    return () => {
        if(target) observer.unobserve(target);
    };

  }, []);

  return (
    <div className="w-full bg-background text-foreground">
      <section className={cn(
        "h-[60vh] md:h-[80vh] flex items-center justify-center text-center overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-black to-slate-800",
        "bg-animated-gradient"
      )}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 id="hero-title" className="text-4xl md:text-6xl font-bold tracking-tighter !leading-tight font-headline text-primary-foreground dark:text-foreground opacity-0">
              Your Campus Community, Reimagined.
            </h1>
            <p id="hero-p" className="max-w-3xl text-lg md:text-xl text-primary-foreground/90 dark:text-foreground/90 font-subheading opacity-0">
              Mitra bridges the gap between your skills and real-world impact. Join events, contribute to open-source projects, and find mentors—all in one place.
            </p>
            <div id="hero-buttons" className="flex flex-col sm:flex-row gap-4">
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

      <section id="mitra-stands-for-section" className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-x-2">
                    What <Logo /> Stands For
                </h2>
                <p className="text-muted-foreground mt-2 font-subheading">Our name reflects our mission to build a thriving community.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
                <div className="p-6 rounded-lg flex flex-col items-center mitra-acronym-card opacity-0">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">M</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Meet & Mentor</h4>
                    <p className="text-muted-foreground">Connect with peers, alumni, and experienced professionals.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center mitra-acronym-card opacity-0">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">I</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Ignite Innovation</h4>
                    <p className="text-muted-foreground">Participate in hackathons to build groundbreaking projects.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center mitra-acronym-card opacity-0">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">T</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Tackle Challenges</h4>
                    <p className="text-muted-foreground">Join forces with others to solve real-world problems through volunteering.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center mitra-acronym-card opacity-0">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">R</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Reinforce Skills</h4>
                    <p className="text-muted-foreground">Gain practical experience by contributing to open-source projects.</p>
                </div>
                <div className="p-6 rounded-lg flex flex-col items-center mitra-acronym-card opacity-0">
                    <h3 className="text-5xl font-bold text-primary font-headline mb-4">A</h3>
                    <h4 className="text-xl font-semibold mb-2 font-headline">Activate Your Portfolio</h4>
                    <p className="text-muted-foreground">Be an active part of the tech scene and build your resume.</p>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
