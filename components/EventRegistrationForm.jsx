"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Loader2,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function EventRegistrationForm({ eventId, eventData }) {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const timerRef = useRef(null);

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

  // Set up timer when component mounts
  useEffect(() => {
    // Only setup timer if we have data with a deadline
    if (!eventData || !eventData.registration_deadline) return;

    // Clear any existing interval first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Function to update the timer state
    const updateTimer = () => {
      const { expired, timeString } = calculateTimeRemaining(
        eventData.registration_deadline
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
  }, [eventData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegistrationStatus(null);

    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          eventName: eventData.title,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationStatus({ type: "success", message: data.message });
        toast.success(data.message);
      } else {
        setRegistrationStatus({ type: "error", message: data.message });
        toast.error(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      setRegistrationStatus({
        type: "error",
        message: "Registration failed. Please try again.",
      });
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Processing registration...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto mt-8 border-t-4 border-t-primary shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-primary" />
            Event Registration
          </CardTitle>
          {eventData.spots_left && registrationOpen && (
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {eventData.spots_left} spots left
            </span>
          )}
        </div>
        <CardDescription className="text-base">
          {registrationOpen
            ? "Complete your registration for this exciting event!"
            : "Registration for this event is now closed."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Registration Deadline Information */}
        {eventData.registration_deadline && (
          <div className={`flex justify-center mb-4`}>
            <Badge
              className="flex items-center gap-2 text-sm py-2 px-3"
              variant={registrationOpen ? "outline" : "destructive"}
            >
              <Clock className="w-4 h-4" />
              {registrationOpen ? (
                <span>Registration closes in: {timeRemaining}</span>
              ) : (
                <span>Registration Closed</span>
              )}
            </Badge>
          </div>
        )}

        {registrationStatus && (
          <Alert
            variant={
              registrationStatus.type === "error" ? "destructive" : "default"
            }
          >
            {registrationStatus.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{registrationStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 rounded-lg space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{eventData.title}</h3>
            <p className="text-gray-600">{eventData.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(eventData.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(eventData.date)}</span>
            </div>
            {eventData.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{eventData.location}</span>
              </div>
            )}
            {eventData.attendees && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{eventData.attendees} attendees registered</span>
              </div>
            )}
          </div>
        </div>

        {!registrationOpen && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Registration for this event has closed. Please check our other
              upcoming events.
            </AlertDescription>
          </Alert>
        )}

        {registrationOpen && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register for Event"
              )}
            </Button>
          </form>
        )}

        {!registrationOpen && (
          <Button className="w-full" variant="secondary" size="lg" disabled>
            <Clock className="w-4 h-4 mr-2" />
            Registration Closed
          </Button>
        )}
      </CardContent>

      <CardFooter className="text-sm text-gray-500 text-center">
        {registrationOpen
          ? "By registering, you agree to attend the event and follow the event guidelines"
          : "This event's registration period has ended"}
      </CardFooter>
    </Card>
  );
}
