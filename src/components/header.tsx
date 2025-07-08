
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, LogOut, LayoutDashboard, Compass, ShieldCheck, UserPlus, LogInIcon, Users, GraduationCap, Code, Trophy } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { Logo } from "./logo";

const loggedOutLinks = [
  { href: "/", label: "Home" },
];

const loggedInLinks = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/hackathons", label: "Hackathons", icon: Trophy },
  { href: "/projects", label: "Projects", icon: Code },
  { href: "/connections", label: "Connections", icon: Users },
  { href: "/mentors", label: "Mentors", icon: GraduationCap },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = user ? loggedInLinks : loggedOutLinks;

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void; }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
        pathname === href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
  
  const MobileNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void; }) => (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-4 py-3 rounded-lg text-base font-medium transition-colors flex items-center gap-3",
        pathname === href
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-6 hidden md:flex">
          <Link href="/" className="flex items-center">
            <Logo className="text-2xl" />
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <SheetHeader>
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo className="text-2xl" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 py-4">
                {navLinks.map((link) => {
                  const Icon = (link as any).icon;
                  return (
                    <MobileNavLink key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{link.label}</span>
                    </MobileNavLink>
                  );
                })}
              </div>
              
              {!loading && !user && (
                <div className="mt-auto flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <LogInIcon className="mr-2 h-4 w-4" />
                      Log In
                    </Link>
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
        {!loading && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'host' && (
                      <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                              <LayoutDashboard className="mr-2 h-4 w-4" />
                              <span>My Dashboard</span>
                          </Link>
                      </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                          <Link href="/admin">
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                          </Link>
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/login">
                          <LogInIcon className="mr-2 h-4 w-4" />
                          Log In
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Account
                        </Link>
                    </Button>
                </div>
            )}
          </>
        )}
        </div>
      </div>
    </header>
  );
}
