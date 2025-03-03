"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Loader2,
  MessageCircle,
  ThumbsUp,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const questionsPerPage = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questions`);

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQuestions();
    setIsRefreshing(false);
  };

  const allTags = Array.from(
    new Set(
      questions.flatMap((q) =>
        q.tags ? q.tags.split(",").map((tag) => tag.trim()) : []
      )
    )
  );

  const filteredQuestions = questions
    .filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((question) =>
      selectedTag === "all" ? true : question.tags?.includes(selectedTag)
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      return b.likes - a.likes;
    });

  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const QuestionCard = ({ question }) => {
    const formattedDate = new Date(question.created_at).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    return (
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-black-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link href={`user-profile/${question?.user_id}`}>
              <Avatar className="border-2 border-blue-100">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.user_name}`}
                />
                <AvatarFallback>{question.user_name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`user-profile/${question?.user_id}`}>
                <p className="font-medium ">{question.user_name}</p>
              </Link>
              <p className="text-sm ">{formattedDate}</p>
            </div>
          </div>

          <Link href={`/questions/${question.id}`} className="group">
            <h2 className="text-xl font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
              {question.title}
            </h2>
          </Link>

          {question.tags && (
            <div className="flex flex-wrap gap-2">
              {question.tags.split(",").map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => setSelectedTag(tag.trim())}
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              {question.likes || 0} likes
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {question.answers_count || 0} answers
            </div>
          </div> */}
        </div>
      </Card>
    );
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-8 h-8 animate-spin " />
      <p className=" animate-pulse">Loading questions...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );

  if (!mounted) return null;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-6 md:flex-row justify-between items-center bg-gradient-to-r  p-6 rounded-lg">
          <div>
            <h1 className="text-3xl font-bold ">Community Questions</h1>
            <p className=" mt-2">
              Explore and contribute to our growing community
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={isRefreshing ? "animate-spin" : ""}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Link href="/questions/new" className="flex items-center gap-2">
              <Button className="w-full md:w-auto" size="lg">
                <MessageCircle className="w-4 h-4" />
                Ask a Question
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4  p-4 rounded-lg shadow-sm">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 " />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Clock className="w-4 h-4 mr-2" />
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Most Popular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>

        <div className="space-y-4">
          {currentQuestions.length === 0 ? (
            <div className="text-center py-10  rounded-lg">
              <MessageCircle className="w-12 h-12  mx-auto mb-4" />
              <p className="">No questions found. Be the first to ask!</p>
            </div>
          ) : (
            <>
              {currentQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((num) => {
                    if (totalPages <= 5) return true;
                    if (num === 1 || num === totalPages) return true;
                    return Math.abs(currentPage - num) <= 1;
                  })
                  .map((number, index, array) => (
                    <React.Fragment key={number}>
                      {index > 0 && array[index] - array[index - 1] > 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={currentPage === number ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </Button>
                    </React.Fragment>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
