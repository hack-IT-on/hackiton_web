"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const interests = [
  "Programming",
  "Design",
  "Marketing",
  "Data Science",
  "Entrepreneurship",
];

export default function NewEventPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    image_url: "",
    date: "",
    registration_deadline: "",
    location: "",
    interest: "",
    is_active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate all required fields
    if (
      !formData.title ||
      !formData.description ||
      !formData.long_description ||
      !formData.date ||
      !formData.registration_deadline ||
      !formData.location ||
      !formData.interest ||
      !formData.image_url
    ) {
      setError("Please fill in all required fields including image URL");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/events/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
      }

      router.push("/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkdownChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      long_description: value || "",
    }));
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create New Event</CardTitle>
          <CardDescription>
            All fields are required to create a new event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  type="datetime-local"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="registration_deadline"
                  className="text-sm font-medium"
                >
                  Registration Deadline<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registration_deadline"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  type="datetime-local"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Short Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of your event"
                className="h-20"
                required
              />
            </div>

            <div className="space-y-2" data-color-mode="light">
              <Label htmlFor="long_description" className="text-sm font-medium">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
              <div className="min-h-[300px]">
                <MDEditor
                  value={formData.long_description}
                  onChange={handleMarkdownChange}
                  preview="edit"
                  height={300}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Event location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest" className="text-sm font-medium">
                  Interest Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.interest}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, interest: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interest" />
                  </SelectTrigger>
                  <SelectContent>
                    {interests.map((interest) => (
                      <SelectItem key={interest} value={interest.toLowerCase()}>
                        {interest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm font-medium">
                  Image URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[150px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
