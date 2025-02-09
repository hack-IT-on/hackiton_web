import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, ThumbsUp } from "lucide-react";
import Link from "next/link";

export function ProjectCard({ project }) {
  const handleLinkClick = (e, url) => {
    e.preventDefault();
    window.open(url, "_blank");
  };

  // Parse technologies from JSON string
  const technologies =
    typeof project.technologies === "string"
      ? JSON.parse(project.technologies)
      : project.technologies || [];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 flex-1">
            {project.title}
          </CardTitle>
          {/* <div className="flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">{project.upvotes}</span>
          </div> */}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm text-muted-foreground">
            by {project.author}
          </div>
          <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
            {project.category}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-full text-xs"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="text-xs text-muted-foreground py-1">
              +{technologies.length - 3} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-1"
          onClick={(e) => handleLinkClick(e, project.githubUrl)}
        >
          <Github className="w-4 h-4" />
          GitHub
        </Button>
        {project.demoUrl && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1"
            onClick={(e) => handleLinkClick(e, project.demoUrl)}
          >
            <ExternalLink className="w-4 h-4" />
            Demo
          </Button>
        )}
        {/* <Link href={`/projects/${project.id}`} className="flex-1">
          <Button variant="default" size="sm" className="w-full">
            View Details
          </Button>
        </Link> */}
      </CardFooter>
    </Card>
  );
}
