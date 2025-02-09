import GitHubProjects from "@/components/GithubProjects";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Github } from "lucide-react";
import Projects from "@/components/Projects";

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-8">
      <div className="container mx-auto px-4">
        {/* <h1 className="text-4xl font-bold text-center mb-8">My Projects</h1> */}

        <Tabs defaultValue="github" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                Github Projects
              </TabsTrigger>
              <TabsTrigger value="hackiton" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Hack It On
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="github"
            className="mt-0 focus-visible:outline-none"
          >
            <div className="space-y-6">
              <GitHubProjects user={user} />
            </div>
          </TabsContent>

          <TabsContent
            value="hackiton"
            className="mt-0 focus-visible:outline-none"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                {/* <div className="grid gap-6">
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center space-y-4">
                      <Trophy className="w-12 h-12 mx-auto text-primary" />
                      <h3 className="text-2xl font-semibold">
                        Hack It On Projects
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Your hackathon and side project showcase. Coming soon!
                      </p>
                    </div>
                  </div>
                </div> */}
                <Projects user={user} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
