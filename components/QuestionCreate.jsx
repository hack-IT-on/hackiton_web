"use client";

import React, { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const QuestionCreate = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [value, setValue] = useState("*Your question here*");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // function notify() {
  //   toast("Good Job!", {
  //     icon: "👏",
  //   });
  // }

  // notify();

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

      toast.success("Your question submited for approval.");
      router.push("/questions");
    } catch (err) {
      setError(err.message || "Failed to submit question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create a Question</h1>
        <p className="text-muted-foreground">
          Share your question with the community. Be specific and provide all
          relevant details.
        </p>
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
          <div data-color-mode="light" className="border rounded-md">
            <MDEditor
              value={value}
              onChange={setValue}
              // preview="edit"
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
