"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import MDEditor from "@uiw/react-md-editor";
import { use, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function EventPage({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { theme, systemTheme } = useTheme();

  // Handle theme mounting to avoid hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Use explicit formatting to avoid locale differences
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Format hours and minutes with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "AM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12

    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        const eventData = await response.json();
        setData(eventData);
        // console.log(eventData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <Badge className="w-fit" variant="secondary">
            {data.interest}
          </Badge>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {data.title}
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{formatDate(data.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{data.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <span>{data.interest}</span>
            </div>
          </div>
        </CardHeader>

        <img
          src={data.image_url}
          alt={data.title}
          className="w-full object-cover h-96"
        />

        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">{data.description}</p>
          </div>

          <Separator className="my-6" />

          <div className="prose max-w-none">
            {data.long_description && (
              <div data-color-mode={currentTheme}>
                <MDEditor.Markdown
                  source={data.long_description}
                  style={{
                    whiteSpace: "pre-wrap",
                    // backgroundColor: "transparent",
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-secondary/10">
          <Button size="lg" className="w-full transition-all" asChild>
            <Link
              href={`/events/${id}/register`}
              // target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 group"
            >
              Apply Now
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
