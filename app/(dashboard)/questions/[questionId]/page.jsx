"use client";
import React, { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Flag,
  Clock,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Mail,
  MessageCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

const QuestionDetail = () => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [value, setValue] = useState("*Your answer here*");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("votes");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState("edit");
  const { questionId } = useParams();
  const router = useRouter();
  const answerRef = useRef(null);
  const { theme, systemTheme } = useTheme();

  // Handle theme mounting to avoid hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the effective theme (handling "system" preference)
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const [questionData, answersData] = await Promise.all([
          fetch(`/api/questions/${questionId}`).then((res) => res.json()),
          fetch(`/api/questions/${questionId}/answers`).then((res) =>
            res.json()
          ),
        ]);

        setQuestion(questionData[0]);
        setAnswers(answersData);
      } catch (error) {
        console.error("Error fetching question details:", error);
      }
    };

    fetchQuestionDetails();
  }, [questionId]);

  const handleShare = async (platform) => {
    const currentUrl = window.location.href;
    const title = question?.title || "";
    const text = `Check out this question from hack-it-on: ${title}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        currentUrl
      )}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        currentUrl
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        currentUrl
      )}`,
      email: `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(text + "\n\n" + currentUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + currentUrl
      )}`,
    };

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }

    setIsShareDialogOpen(false);
  };

  const handleAnswerSubmit = async () => {
    if (!value.trim()) return;

    setLoading(true);
    try {
      await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        body: JSON.stringify({
          content: value,
          questionId: questionId,
        }),
      });

      await fetch("/api/points", {
        method: "POST",
        body: JSON.stringify({
          activityName: "answer_question",
          activityDescription: "Answered on: " + question.title,
        }),
      });

      window.location.reload();
      toast.success("Answer submitted! You've just earned 10 points and 2🪙!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (answerId) => {
    try {
      await fetch(`/api/answers/${answerId}/upvote`, { method: "POST" });
      setAnswers(
        answers.map((answer) =>
          answer.id === answerId
            ? { ...answer, upvotes: answer.upvotes + 1 }
            : answer
        )
      );
    } catch (error) {
      console.error("Error upvoting answer:", error);
    }
  };

  const scrollToAnswer = () => {
    answerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Toggle preview function
  const togglePreview = () => {
    setPreviewMode(previewMode === "edit" ? "preview" : "edit");
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedAnswers = [...answers].sort((a, b) =>
    sortBy === "votes"
      ? b.upvotes - a.upvotes
      : new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${question.user_name}`}
                />
                <AvatarFallback>{question.user_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{question.user_name}</p>
                <p className="text-sm text-gray-500">
                  Asked{" "}
                  {formatDistanceToNow(new Date(question.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              <Clock className="w-4 h-4 mr-1" />
              Active
            </Badge>
          </div>
          <CardTitle className="text-3xl">{question.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" data-color-mode={currentTheme}>
            <MDEditor.Markdown
              source={question.content}
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" onClick={scrollToAnswer}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Answer
              </Button>
              <Dialog
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share this question</DialogTitle>
                    <DialogDescription>
                      Choose how you'd like to share this question
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShare("twitter")}
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShare("linkedin")}
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShare("email")}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShare("whatsapp")}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 col-span-2"
                      onClick={() => handleShare("copy")}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {/* <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button> */}
            </div>
            <Badge variant="outline">{answers.length} answers</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Answers</h2>
        </div>

        {sortedAnswers.map((answer) => (
          <Card key={answer.id}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <Link href={`/user-profile/${answer?.user_id}`}>
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${answer.user_name}`}
                    />
                    <AvatarFallback>{answer.user_name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/user-profile/${answer?.user_id}`}>
                    <p className="font-semibold">{answer.user_name}</p>
                  </Link>
                  <p className="text-sm text-gray-500">
                    Answered{" "}
                    {formatDistanceToNow(new Date(answer.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div data-color-mode={currentTheme}>
                <MDEditor.Markdown
                  source={answer.content}
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card ref={answerRef}>
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePreview}
              className="flex items-center gap-1"
            >
              {previewMode === "edit" ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show Preview</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide Preview</span>
                </>
              )}
            </Button>
          </div>
          <div data-color-mode={currentTheme}>
            <MDEditor
              value={value}
              onChange={setValue}
              preview={previewMode}
              className="min-h-[200px]"
            />
          </div>
          <Button
            onClick={handleAnswerSubmit}
            className="mt-4"
            disabled={loading || !value.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Answer"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetail;
