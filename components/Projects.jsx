"use client";
import { useState, useEffect } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectFilters } from "@/components/ProjectFilters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProjectsPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.append("category", category);
        if (search) params.append("search", search);
        params.append("sort", sort);
        if (activeTab === "my-projects" && user?.id) {
          params.append("userId", user.id);
        }

        const res = await fetch(`/api/projects?${params}`);
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // You could add error state handling here
      } finally {
        setIsLoading(false);
      }
    };

    // Add debounce for search
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, category, sort, activeTab, user?.id]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-4xl font-bold">Student Projects</h1>
          {user?.upload_project && (
            <Link href="/projects/new">
              <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Code className="w-4 h-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">
              All Projects
            </TabsTrigger>
            {user && (
              <TabsTrigger value="my-projects" className="flex-1 sm:flex-none">
                My Projects
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>

        <ProjectFilters
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
          className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        />

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.length > 0 ? (
              projects.map((project) => (
                <motion.div key={project.id} variants={item}>
                  <ProjectCard project={project} className="h-full" />
                </motion.div>
              ))
            ) : (
              <motion.div variants={item} className="col-span-full">
                <Card className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center p-12">
                      <div className="text-center space-y-4">
                        <Trophy className="w-12 h-12 mx-auto text-primary animate-bounce" />
                        <h3 className="text-2xl font-semibold">
                          No Projects Found
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                          {search || category !== "all"
                            ? "Try adjusting your filters or search terms"
                            : "Be the first to showcase your project!"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
