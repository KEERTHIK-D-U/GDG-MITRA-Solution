
"use client";

import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border/40 py-6">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div className="flex items-center mb-4 md:mb-0">
          <Logo className="text-2xl" />
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Mitra. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
