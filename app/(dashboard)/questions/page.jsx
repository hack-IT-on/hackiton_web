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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  useEffect(() => {
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

    fetchQuestions();
  }, []);

  const filteredQuestions = questions
    .filter((question) =>
      question.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      return b.likes - a.likes;
    });

  // Pagination calculations
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PaginationControls = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    const visiblePages = pageNumbers.filter((number) => {
      if (totalPages <= 5) return true;
      if (number === 1 || number === totalPages) return true;
      if (Math.abs(currentPage - number) <= 1) return true;
      return false;
    });

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {visiblePages.map((number, index) => {
          // Add ellipsis
          if (index > 0 && number - visiblePages[index - 1] > 1) {
            return (
              <React.Fragment key={`ellipsis-${number}`}>
                <span className="px-2">...</span>
                <Button
                  variant={currentPage === number ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              </React.Fragment>
            );
          }

          return (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => paginate(number)}
            >
              {number}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 font-semibold">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Community Questions
            </h1>
            <p className="text-gray-500 mt-2">
              Explore and contribute to our growing community
            </p>
          </div>
          <Button className="w-full md:w-auto" size="lg">
            <Link href="/questions/new" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Ask a Question
            </Link>
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search questions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              onClick={() => setSortBy("recent")}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Recent
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              onClick={() => setSortBy("popular")}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Popular
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {currentQuestions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No questions found. Be the first to ask!
              </p>
            </div>
          ) : (
            <>
              {currentQuestions.map((question) => (
                <Card
                  key={question.id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.user_name}`}
                        />
                        <AvatarFallback>{question.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {question.user_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(question.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Link href={`/questions/${question.id}`}>
                      <h2 className="text-xl font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        {question.title}
                      </h2>
                    </Link>

                    {question.tags && (
                      <div className="flex flex-wrap gap-2">
                        {question.tags.split(",").map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
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
              ))}
              <PaginationControls />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
