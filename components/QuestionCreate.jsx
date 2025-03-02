"use client";

import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, HelpCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const QuestionCreate = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [value, setValue] = useState("*Your question here*");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState("edit");
  const router = useRouter();
  const { theme, systemTheme } = useTheme();

  // Determine the current color mode
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the effective theme (handling "system" preference)
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  // Toggle preview function
  const togglePreview = () => {
    setPreviewMode(previewMode === "edit" ? "preview" : "edit");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !value.trim()) {
      setError("Title and content are required");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: value.trim(),
          tags: tagArray,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit question");
      }

      toast.success("Your question submitted for approval.");
      router.push("/questions");
    } catch (err) {
      setError(err.message || "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create a Question
          </h1>
          <p className="text-muted-foreground">
            Share your question with the community. Be specific and provide all
            relevant details.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Guidelines
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center mb-4">
                Hack-IT-on Question Submission Guidelines 🚀
              </DialogTitle>
            </DialogHeader>

            <div className="prose prose-sm max-w-none">
              <p>
                To ensure a high-quality discussion and learning environment,
                please follow these guidelines when submitting your question on{" "}
                <strong>Hack-IT-on</strong>.
              </p>

              <h3 className="font-bold text-green-600">
                ✅ Do's (Best Practices)
              </h3>

              <ol className="space-y-4">
                <li>
                  <strong>Be Clear & Specific</strong> – Write a precise and
                  well-defined question. Avoid vague or overly broad questions.
                  <ul className="pl-6 mt-2">
                    <li>
                      ❌ <em>"How do I code in Python?"</em>
                    </li>
                    <li>
                      ✅{" "}
                      <em>
                        "How do I optimize a recursive function in Python to
                        avoid stack overflow?"
                      </em>
                    </li>
                  </ul>
                </li>

                <li>
                  <strong>Provide Context</strong> – Explain your problem, what
                  you have tried, and any error messages you received.
                  <ul className="pl-6 mt-2">
                    <li>
                      Include <strong>code snippets</strong>, expected output
                      vs. actual output, and any relevant resources.
                    </li>
                  </ul>
                </li>

                <li>
                  <strong>Use Proper Formatting</strong> – Use markdown for code
                  formatting:
                  <ul className="pl-6 mt-2">
                    <li>
                      Enclose code in triple backticks (```) for better
                      readability.
                    </li>
                    <li>Example:</li>
                  </ul>
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded mt-2 font-mono text-sm">
                    ```python
                    <br />
                    def factorial(n): return 1 if n == 0 else n * factorial(n -
                    1)
                    <br />
                    ```
                  </div>
                </li>
                {/* 
                <li>
                  <strong>Search Before Asking</strong> – Check if your question
                  has already been answered in the community.
                </li> */}

                <li>
                  <strong>Use Appropriate Tags</strong> – Tag your question with
                  relevant topics (e.g., <code>Python</code>,
                  <code>Data Structures</code>, <code>Web Development</code>,{" "}
                  <code>Machine Learning</code>, etc.).
                </li>
              </ol>

              <h3 className="font-bold text-red-600 mt-6">
                🚫 Don'ts (Avoid These Mistakes)
              </h3>

              <ol className="space-y-2">
                <li>
                  <strong>Avoid General or Homework Dumping</strong> – Don't
                  post entire assignments without any effort. Show your approach
                  first.
                </li>

                <li>
                  <strong>No Irrelevant or Off-Topic Questions</strong> – Keep
                  questions related to &nbsp;
                  <strong>
                    coding, programming, algorithms, data structures, or
                    tech-related topics.
                  </strong>
                </li>

                <li>
                  <strong>No Spam</strong> – Questions should be aimed at
                  learning. No spam, please.
                </li>
              </ol>

              <h3 className="font-bold text-blue-600 mt-6">📌 Final Tips</h3>

              <p>
                ✔ Follow these guidelines to{" "}
                <strong>get quick and accurate answers</strong> from the
                community.
                <br />✔ Respect fellow members and engage in meaningful
                discussions.
                {/* <br />✔ If your question is answered,{" "}
                <strong>mark the best answer to help others</strong> in the
                future. */}
              </p>

              <p className="font-bold text-center mt-4">
                Happy Coding! 🚀💡 <strong>– Hack-IT-on Team</strong>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Question Title</Label>
          <Input
            id="title"
            placeholder="e.g., How do I implement authentication in Next.js?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Question Content</Label>
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
          <div data-color-mode={currentTheme} className="border rounded-md">
            <MDEditor
              value={value}
              onChange={setValue}
              preview={previewMode}
              height={400}
              className="border-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="e.g., react, nextjs, authentication"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            Separate tags with commas
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Question"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionCreate;
