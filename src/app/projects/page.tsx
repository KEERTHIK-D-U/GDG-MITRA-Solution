
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getProjects, type Project, contributeToProject } from "@/lib/firebase";
import { GitBranch, Inbox } from "lucide-react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getProjects((fetchedProjects) => {
      setProjects(fetchedProjects);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleContribute = async (project: Project) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to contribute.",
      });
      return;
    }
    
    setContributing(project.id);
    try {
      const result = await contributeToProject(user.uid, user.name, user.email, project.id, project.title);
       if (result.message === "Already contributed.") {
         toast({
            title: "Contribution Already Recorded",
            description: `Your interest in "${project.title}" is already noted.`,
        });
      } else {
        toast({
            title: "Contribution Recorded!",
            description: `Thank you for your interest in "${project.title}".`,
        });
      }
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Contribution Failed",
        description: error.message,
      });
    } finally {
      setContributing(null);
    }
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col items-start space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
            Open Source Projects
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Contribute to meaningful projects, learn new skills, and build your portfolio.
          </p>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
           </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#ced4ce] dark:hover:border-[#00e97b] hover:shadow-[#006a35]/30 dark:hover:shadow-[#00e97b]/30">
                <CardHeader className="p-0">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover rounded-t-lg"
                    data-ai-hint="project code computer"
                  />
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="text-2xl mb-2 font-headline">{project.title}</CardTitle>
                  <p className="text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-secondary/30">
                   <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleContribute(project)}
                      disabled={contributing === project.id}
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      {contributing === project.id ? "Recording..." : "I'm Interested"}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Inbox className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No Projects Found</h3>
            <p className="mt-2 text-muted-foreground">
              There are no open source projects listed right now. Ask a host to create one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
