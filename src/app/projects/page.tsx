
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getProjects, type Project, contributeToProject, getUserProjectContributions } from "@/lib/firebase";
import { GitBranch, Inbox, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth, useRequireAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributing, setContributing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userContributions, setUserContributions] = useState<Set<string>>(new Set());
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      setContributionsLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribeProjects = getProjects(
      (fetchedProjects) => {
        setError(null);
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Failed to load projects",
          description: err.message,
        });
        setLoading(false);
      }
    );

    setContributionsLoading(true);
    getUserProjectContributions(user.uid).then((contribs) => {
        const projectIds = new Set(contribs.map(c => c.projectId));
        setUserContributions(projectIds);
    }).catch(console.error)
      .finally(() => {
        setContributionsLoading(false);
    });

    return () => unsubscribeProjects();
  }, [user, authLoading, toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(lowercasedFilter) ||
        project.description.toLowerCase().includes(lowercasedFilter) ||
        project.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
      );
    });
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);


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
      await contributeToProject(user.uid, user.name, user.email, project.id, project.title);
      setUserContributions(prev => new Set(prev).add(project.id));
      toast({
          title: "Contribution Recorded!",
          description: `Thank you for your interest in "${project.title}".`,
      });
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

  const isLoading = authLoading || loading || contributionsLoading;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col items-start space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">
            Open Source Projects
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground font-subheading">
            Contribute to meaningful projects, learn new skills, and build your portfolio.
          </p>
        </div>
        
        <div className="mb-12 w-full max-w-lg">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects by title, tech, or description..."
                  className="w-full pl-10 pr-4 py-3 text-base rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg border-destructive/50">
            <AlertTriangle className="w-16 h-16 text-destructive" />
            <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        ) : isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
           </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const hasContributed = userContributions.has(project.id);
              const isHost = user?.uid === project.hostId;
              return (
                <Card key={project.id} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-2 hover:border-[#222222] hover:shadow-[#02006c]/40 dark:hover:border-[#00e97b] dark:hover:shadow-[#00e97b]/30">
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
                    <h3 className="text-2xl mb-2 font-semibold">{project.title}</h3>
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
                        variant={hasContributed ? "secondary" : "outline"}
                        onClick={() => !hasContributed && handleContribute(project)}
                        disabled={hasContributed || contributing === project.id || isHost}
                      >
                        {isHost ? (
                          "You are the host"
                        ) : contributing === project.id ? (
                           "Recording..."
                        ) : hasContributed ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Interest Shown
                          </>
                        ) : (
                          <>
                            <GitBranch className="mr-2 h-4 w-4" />
                            I'm Interested
                          </>
                        )}
                      </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed rounded-lg">
            <Inbox className="w-16 h-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">
              {searchTerm ? "No Matching Projects Found" : "No Projects Found"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm
                ? "Try a different search term."
                : "There are no open source projects listed right now. Ask a host to create one!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
