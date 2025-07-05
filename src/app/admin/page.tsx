
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { Users, Trash2 } from "lucide-react";
import { getAllUsers, deleteUserProfile, UserProfile } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  useRequireAuth('admin');
  const { user: adminUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (adminUser) {
      setLoading(true);
      getAllUsers(adminUser.uid)
        .then(setUsers)
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Failed to fetch users",
            description: error.message,
          });
        })
        .finally(() => setLoading(false));
    }
  }, [adminUser, toast]);

  const handleRemoveClick = (user: UserProfile) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserProfile(userToDelete.uid);
      setUsers(users.filter((user) => user.uid !== userToDelete.uid));
      toast({
        title: "User Removed",
        description: `${userToDelete.name} has been successfully removed from the community.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Removal Failed",
        description: error.message,
      });
    } finally {
      setUserToDelete(null);
    }
  };
  
  const totalUsers = users.length;

  return (
    <>
      <div className="bg-secondary/50 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
              Admin Dashboard
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
              Oversee application activity and manage users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#090088]/30 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Total Users</span>
                  <Users className="w-6 h-6 text-muted-foreground" />
                </CardTitle>
                <CardDescription>Excluding admins</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{loading ? "..." : totalUsers}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and remove users from the community.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveClick(user)}>
                                            <Trash2 className="mr-2 h-4 w-4"/> Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's profile
              and remove their data from our servers. It does not delete their authentication record,
              but they will lose all role and profile information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Yes, remove user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
