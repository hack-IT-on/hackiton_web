"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Filter,
  ListFilter,
  BarChart2,
  CheckCircle2,
  Circle,
  Trophy,
  BookOpen,
  Users,
  Timer,
  TrendingUp,
  LayoutGrid,
  List,
  ChartArea,
} from "lucide-react";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function ProblemsListPage() {
  // State definitions
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [view, setView] = useState("grid"); // Added missing view state

  const categories = [
    "All",
    ...new Set(problems.map((p) => p.category)),
  ].sort();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch("/api/problems");
        if (!response.ok) throw new Error("Failed to fetch problems");
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const filteredAndSortedProblems = problems
    .filter((problem) => {
      const matchesSearch = problem.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        problem.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === "All" || problem.category === selectedCategory;
      return matchesSearch && matchesDifficulty && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "solved":
          return (b.solved_count || 0) - (a.solved_count || 0);
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return (
            (difficultyOrder[a.difficulty] || 0) -
            (difficultyOrder[b.difficulty] || 0)
          );
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });

  const getProblemKey = (problem, index) => {
    if (problem.id) return `problem-${problem.id}`;
    return `problem-${index}-${
      problem.title?.toLowerCase().replace(/\s+/g, "-") || "untitled"
    }`;
  };

  const getTagKey = (problemKey, tag, index) => {
    return `${problemKey}-tag-${index}-${tag}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 hover:bg-green-200 text-green-800";
      case "Medium":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "Hard":
        return "bg-red-100 hover:bg-red-200 text-red-800";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Coding Problems</h1>
          <p className="text-muted-foreground mt-1">
            {filteredAndSortedProblems.length} problems available
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Link href={"/problems/profile"}>
            <Button size="sm">
              <ChartArea className="h-4 w-4 mr-2" />
              My Stats
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger>
                <ListFilter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((difficulty) => (
                  <SelectItem
                    key={`difficulty-${difficulty}`}
                    value={difficulty}
                  >
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={`category-${category}`} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <BarChart2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="sort-newest" value="newest">
                  Newest First
                </SelectItem>
                <SelectItem key="sort-solved" value="solved">
                  Most Solved
                </SelectItem>
                <SelectItem key="sort-difficulty" value="difficulty">
                  Difficulty
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div
        className={
          view === "grid"
            ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "grid gap-4"
        }
      >
        {filteredAndSortedProblems.map((problem, index) => {
          const problemKey = getProblemKey(problem, index);
          return (
            <Link
              key={problemKey}
              href={`https://leetcode.com/problems/${problem.titleSlug || ""}`}
              target="_blank"
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    {problem.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <CardTitle className="text-xl font-semibold">
                      {problem.title || "Untitled Problem"}
                    </CardTitle>
                  </div>
                  <Badge
                    className={`${getDifficultyColor(
                      problem.difficulty
                    )} transition-colors duration-200`}
                  >
                    {problem.difficulty || "Unknown"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="hover:bg-gray-100">
                        {problem.category || "Uncategorized"}
                      </Badge>
                      {problem.tags?.map((tag, tagIndex) => (
                        <Badge
                          key={getTagKey(problemKey, tag, tagIndex)}
                          variant="secondary"
                          className="text-xs hover:bg-gray-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{problem.solved_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        <span>{problem.estimated_time || "15m"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
