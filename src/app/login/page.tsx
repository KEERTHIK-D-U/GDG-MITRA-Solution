
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, UserRole } from "@/lib/firebase";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  
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
  
  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Send Email",
        description: error.message,
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 p-4">
        <Card className="mx-auto max-w-sm w-full shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome Back!</CardTitle>
            <CardDescription>Enter your credentials to log in.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                
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
                          <DialogTrigger asChild>
                              <Button type="button" variant="link" className="ml-auto inline-block p-0 h-auto text-sm underline font-normal">
                                Forgot your password?
                              </Button>
                          </DialogTrigger>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-full -translate-y-1/2"
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                          </Button>
                        </div>
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

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Your Password</DialogTitle>
          <DialogDescription>
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="m@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSendResetEmail} disabled={isResetting}>
            {isResetting ? "Sending..." : "Send Reset Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
