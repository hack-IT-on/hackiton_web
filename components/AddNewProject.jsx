"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Github, Link, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "web", label: "Web Development", icon: "🌐" },
  { value: "mobile", label: "Mobile Apps", icon: "📱" },
  { value: "ai", label: "AI/ML", icon: "🤖" },
  { value: "game", label: "Game Development", icon: "🎮" },
  { value: "other", label: "Other", icon: "💡" },
];

export default function AddNewProject() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    githubUrl: "",
    demoUrl: "",
    technologies: [],
    currentTech: "",
  });

  const handleTechKeyDown = (e) => {
    if (e.key === "Enter" && formData.currentTech.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(formData.currentTech.trim())) {
        setFormData((prev) => ({
          ...prev,
          technologies: [...prev.technologies, prev.currentTech.trim()],
          currentTech: "",
        }));
      }
    }
  };

  const removeTechnology = (techToRemove) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (
        !formData.title ||
        !formData.description ||
        !formData.category ||
        !formData.githubUrl
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.technologies.length === 0) {
        throw new Error("Please add at least one technology");
      }

      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(formData.githubUrl)) {
        throw new Error("Please enter a valid GitHub URL");
      }
      if (formData.demoUrl && !urlRegex.test(formData.demoUrl)) {
        throw new Error("Please enter a valid demo URL");
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          technologies: formData.technologies,
          githubUrl: formData.githubUrl,
          demoUrl: formData.demoUrl || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create project");

      router.push("/projects");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Project</CardTitle>
          <CardDescription>
            Share your project with the community. Fields marked with * are
            required.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Project Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter a descriptive title for your project"
                maxLength={100}
                className="focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What does your project do? What technologies did you use? What challenges did you overcome?"
                className="h-32 focus:ring-2 focus:ring-primary"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        {category.icon} {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Technologies <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.currentTech}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentTech: e.target.value,
                  }))
                }
                onKeyDown={handleTechKeyDown}
                placeholder="Type a technology and press Enter (e.g., React, Node.js, Python)"
                className="focus:ring-2 focus:ring-primary"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.technologies.map((tech) => (
                  <div
                    key={tech}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-in fade-in-50 duration-100"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="hover:text-destructive transition-colors"
                      aria-label={`Remove ${tech}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                GitHub URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      githubUrl: e.target.value,
                    }))
                  }
                  placeholder="https://github.com/username/project"
                  type="url"
                  className="pl-10 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Demo URL (optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.demoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      demoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://your-demo-url.com"
                  type="url"
                  className="pl-10 focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-28"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-28">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
