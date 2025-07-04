import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/mock-data";
import { GitBranch, Inbox } from "lucide-react";

export default function ProjectsPage() {
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

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[#00e97b] hover:shadow-[#00e97b]/30">
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
                  <Button asChild className="w-full" variant="outline">
                    <Link href="#">
                      <GitBranch className="mr-2 h-4 w-4" />
                      Contribute
                    </Link>
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
              There are no open source projects listed right now. Feel free to start one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
