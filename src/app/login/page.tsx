
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/google-icon";
import { Separator } from "@/components/ui/separator";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, getUserProfile, UserRole } from "@/lib/firebase";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRedirect = useCallback((role?: UserRole) => {
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'host') {
      router.push('/dashboard');
    } else {
      router.push('/discover');
    }
  }, [router]);

  // Effect to redirect users who are already logged in when they visit the page
  useEffect(() => {
    // If auth is no longer loading and we have a user object, redirect them.
    if (!authLoading && user) {
      handleRedirect(user.role);
    }
  }, [user, authLoading, handleRedirect]);

  // Show a loading screen to prevent the login form from flashing for already-authenticated users.
  if (authLoading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      // We only need to trigger the sign-in. The AuthProvider will detect
      // the change and update the global state. The useEffect hook above will
      // then handle the redirect once the user object is available.
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: "Login Successful!",
        description: "Welcome back. Redirecting...",
      });
      // No redirect here. Let the AuthProvider and useEffect do their job.
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setLoading(false); // Only set loading to false on failure
    }
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const userProfile = await getUserProfile(result.user.uid);

        // For Google sign-in, we must check if a profile exists.
        // If not, the user needs to go through the signup flow to choose a role.
        if (!userProfile) {
             await auth.signOut();
             toast({
                variant: "destructive",
                title: "No Account Found",
                description: "Please sign up first to select your role.",
            });
            router.push('/signup');
            setLoading(false);
            return;
        }

        // If the profile exists, the AuthProvider and useEffect will handle redirection.
        toast({
          title: "Login Successful!",
          description: "Welcome back. Redirecting...",
        });

    } catch (error: any) {
        if (error.code === 'auth/account-exists-with-different-credential') {
             toast({
                variant: "destructive",
                title: "Account Exists",
                description: "This email is registered with a password. Please log in with your email and password.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Google Sign-In Failed",
                description: error.message,
            });
        }
        setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 p-4">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">

              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={loading}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Login with Google
              </Button>
              
              <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                      <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                      </span>
                  </div>
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                   <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                        </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
