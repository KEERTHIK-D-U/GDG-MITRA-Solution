
import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import Script from "next/script";
import { FloatingMentorButton } from "@/components/floating-mentor-button";
import { TutorialProvider } from "@/components/tutorial-provider";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: "700",
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mitra",
  description: "The official platform for the Mitra community. Connect, collaborate, and contribute to impactful events and projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased bg-background min-h-screen flex flex-col",
        inter.variable,
        orbitron.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={['light', 'dark']}
        >
          <AuthProvider>
            <TutorialProvider />
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center gap-4">
              <FloatingMentorButton />
              <ThemeToggle />
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" />
      </body>
    </html>
  );
}
