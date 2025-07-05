
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, createUserProfile, UserRole } from "@/lib/firebase";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, HandHeart, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
  role: z.enum(["volunteer", "host", "mentor"], { required_error: "You must select a role." }),
  college: z.string().min(1, { message: "College name is required." }),
  linkedinUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const roleInfo = {
    volunteer: {
        icon: HandHeart,
        title: "Contributor",
        description: "Join events, contribute to projects, and make a difference in the community.",
    },
    host: {
        icon: Trophy,
        title: "Organizer",
        description: "Organize events, create projects, and host hackathons for the community.",
    },
    mentor: {
        icon: User,
        title: "Guide",
        description: "Share your experience and support fellow community members on their journey.",
    }
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      college: "",
      linkedinUrl: "",
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    form.setValue("role", role);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await createUserProfile(userCredential.user, data.fullName, data.role as UserRole, { 
        linkedinUrl: data.linkedinUrl,
        college: data.college,
      });
      toast({
        title: "Account Created!",
        description: "You have been successfully signed up.",
      });

      if (data.role === 'host') {
        router.push("/dashboard");
      } else if (data.role === 'mentor') {
        router.push("/connections");
      } else {
        router.push("/discover");
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-secondary/50 p-4">
      <Card className="mx-auto max-w-lg w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Join Mitra</CardTitle>
          <CardDescription>
            {selectedRole ? `You've selected the ${selectedRole} role. Fill out the details to join.` : "First, choose your role in our community."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedRole ? (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(roleInfo) as UserRole[]).filter(r => r !== 'admin').map((role) => {
                    const RoleIcon = roleInfo[role].icon;
                    return (
                        <Card 
                            key={role} 
                            onClick={() => handleRoleSelect(role)}
                            className="text-center p-6 cursor-pointer border hover:bg-accent hover:border-primary transition-all"
                        >
                            <div className="flex justify-center mb-4">
                                <RoleIcon className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg">{roleInfo[role].title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{roleInfo[role].description}</p>
                        </Card>
                    )
                })}
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Community Techie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@gmail.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
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
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Input placeholder="Srinivas Institute of Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com/in/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setSelectedRole(null)}>
                        Back to Roles
                    </Button>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Create an account"}
                    </Button>
                </div>
              </form>
            </Form>
          )}

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
