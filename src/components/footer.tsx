
"use client";

import { HandHeart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border/40 py-6">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <HandHeart className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Mitra</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mitra. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
