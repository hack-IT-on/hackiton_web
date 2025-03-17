"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Link, X } from "lucide-react";

const ImageURLForm = () => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);

    // Set preview if URL is valid
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setPreview(url);
      setError("");
    } else if (url) {
      setPreview(null);
      setError("Please enter a valid URL starting with http:// or https://");
    } else {
      setPreview(null);
      setError("");
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("tags", tags);
      formData.append("imageUrl", imageUrl);

      const response = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success("Image added successfully");

      // Reset form
      setTitle("");
      setTags("");
      setImageUrl("");
      setPreview(null);
    } catch (error) {
      setError("Failed to add image. Please try again.");
      toast.error("Failed to add image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Add Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter image title"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate tags with commas"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              required
              placeholder="https://example.com/image.jpg"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
          </div>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-48 object-contain rounded-lg"
                onError={() => {
                  setError("Failed to load image. Please check the URL.");
                  setPreview(null);
                }}
              />
              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && <Progress value={33} className="w-full" />}

          <Button
            type="submit"
            disabled={loading || !imageUrl || error}
            className="w-full transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4" />
                Add Image
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ImageURLForm;
