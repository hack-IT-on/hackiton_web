"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import MDEditor from "@uiw/react-md-editor";
import { use, useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function EventPage({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const timerRef = useRef(null);
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
    if (!dateString) return "";

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
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12

    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  };

  // Calculate time remaining until registration deadline
  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return { expired: true, timeString: "Registration Closed" };

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const total = deadlineDate - now;

    if (total <= 0) {
      return { expired: true, timeString: "Registration Closed" };
    }

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    let timeString = "";
    if (days > 0) {
      timeString += `${days}d `;
    }
    if (days > 0 || hours > 0) {
      timeString += `${hours}h `;
    }
    if (days > 0 || hours > 0 || minutes > 0) {
      timeString += `${minutes}m `;
    }
    timeString += `${seconds}s`;

    return { expired: false, timeString };
  };

  // Fetch event data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        const eventData = await response.json();
        setData(eventData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Clean up any existing timer when component mounts or id changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  // Set up timer when data is available
  useEffect(() => {
    // Only setup timer if we have data with a deadline
    if (!data || !data.registration_deadline) return;

    // Clear any existing interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Function to update the timer state
    const updateTimer = () => {
      const { expired, timeString } = calculateTimeRemaining(
        data.registration_deadline
      );
      setTimeRemaining(timeString);
      setRegistrationOpen(!expired);
    };

    // Update immediately
    updateTimer();

    // Set up interval and store reference
    timerRef.current = setInterval(updateTimer, 1000);

    // Clean up interval on unmount or when data changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No event data found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <Badge className="w-fit" variant="secondary">
              {data.interest}
            </Badge>

            {data.registration_deadline && (
              <Badge
                className="flex items-center gap-2"
                variant={registrationOpen ? "outline" : "destructive"}
              >
                <Clock className="w-4 h-4" />
                {registrationOpen ? (
                  <span>Registration closes in: {timeRemaining}</span>
                ) : (
                  <span>Registration Closed</span>
                )}
              </Badge>
            )}
          </div>

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

          {/* Add a more prominent countdown display */}
          {data.registration_deadline && registrationOpen && (
            <div className="mt-4 p-3  border border-green-200 rounded-md">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  Registration closes in: {timeRemaining}
                </span>
              </div>
            </div>
          )}

          {data.registration_deadline && !registrationOpen && (
            <div className="mt-4 p-3  border border-red-200 rounded-md">
              <div className="flex items-center justify-center gap-2 text-red-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Registration Closed</span>
              </div>
            </div>
          )}
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
            <div data-color-mode={currentTheme}>
              <MDEditor.Markdown
                source={data.long_description}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-secondary/10">
          {registrationOpen ? (
            <Button size="lg" className="w-full transition-all" asChild>
              <Link
                href={`/events/${id}/register`}
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 group"
              >
                Apply Now
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full" variant="secondary" disabled>
              Registration Closed
              <Clock className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
