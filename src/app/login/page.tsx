
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

  useEffect(() => {
    // This effect handles redirection for logged-in users.
    // It runs when the component mounts and whenever the user's auth state changes.
    if (!authLoading && user) {
      handleRedirect(user.role);
    }
  }, [user, authLoading, handleRedirect]);

  // If we are checking auth or the user is logged in, show a loading screen.
  // This prevents the login form from flashing on the screen for users who are already authenticated.
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
      // We only need to authenticate. The `onAuthStateChanged` listener
      // in AuthContext will detect the new user, fetch their profile,
      // and the useEffect on this page will handle the redirect.
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      toast({
        title: "Login Successful!",
        description: "Welcome back. Redirecting...",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setLoading(false); // Only set loading to false on failure
    }
    // No finally block, because on success we want the loading spinner to persist
    // until the page redirects.
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const userProfile = await getUserProfile(result.user.uid);

        // A user might sign in with Google but not have a profile if they abandoned the signup process.
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

        toast({
          title: "Login Successful!",
          description: "Welcome back. Redirecting...",
        });
        // The useEffect will handle the redirect after AuthContext updates.
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
        setLoading(false); // Only set loading to false on failure
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
