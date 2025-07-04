"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/google-icon";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 p-4">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Join Mitra</CardTitle>
          <CardDescription>Create an account to start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <RadioGroup defaultValue="volunteer" className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="volunteer" id="volunteer" className="peer sr-only" />
                <Label
                  htmlFor="volunteer"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  I'm a Volunteer
                </Label>
              </div>
              <div>
                <RadioGroupItem value="host" id="host" className="peer sr-only" />
                <Label
                  htmlFor="host"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  I'm a Host
                </Label>
              </div>
            </RadioGroup>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or create account with
                    </span>
                </div>
            </div>

            <Button variant="outline" className="w-full">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>
            
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" placeholder="Mangalore Techie" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
