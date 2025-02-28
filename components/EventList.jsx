import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Tag,
  ExternalLink,
  CircleCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function EventList({ events }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventType, setEventType] = useState("internal"); // New state for event type
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [externalEvents, setExternalEvents] = useState([]); // State for external events

  // Fetch external events when component mounts or event type changes
  useEffect(() => {
    if (eventType === "external" && mounted) {
      const fetchExternalEvents = async () => {
        try {
          const response = await fetch("/api/external-events");
          if (!response.ok) {
            throw new Error("Failed to fetch external events");
          }
          const data = await response.json();
          setExternalEvents(data);
        } catch (error) {
          console.error("Error fetching external events:", error);
        }
      };

      fetchExternalEvents();
    }
  }, [eventType, mounted]);

  // Update current time every second for countdown timer
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  };

  const getTimeRemaining = (deadline) => {
    const total = new Date(deadline) - currentTime;

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

  // Determine which events to display based on filters
  const currentEvents = eventType === "internal" ? events : externalEvents;

  const filteredEvents = currentEvents.filter((event) => {
    if (statusFilter === "active") return event.is_active;
    if (statusFilter === "inactive") return !event.is_active;
    return true;
  });

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Event Type Toggle */}
      <div className="flex gap-4 items-center mb-4">
        <Button
          variant={eventType === "internal" ? "default" : "outline"}
          onClick={() => setEventType("internal")}
          className="min-w-[120px]"
        >
          Internal Events
        </Button>
        <Button
          variant={eventType === "external" ? "default" : "outline"}
          onClick={() => setEventType("external")}
          className="min-w-[120px] flex items-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          External Events
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-4 items-center">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          className="min-w-[100px]"
        >
          All Events
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          onClick={() => setStatusFilter("active")}
          className="min-w-[100px]"
        >
          Active
        </Button>
        <Button
          variant={statusFilter === "inactive" ? "default" : "outline"}
          onClick={() => setStatusFilter("inactive")}
          className="min-w-[100px]"
        >
          Completed
        </Button>
        <Badge variant="secondary" className="ml-2">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"}
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => {
          const { expired, timeString } = getTimeRemaining(
            event.registration_deadline
          );
          const registrationOpen = event.is_active && !expired;
          const isExternal = eventType === "external";

          return (
            <Card
              key={event.id}
              className={`group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl
                ${
                  isExternal
                    ? "border-2 border-blue-500"
                    : registrationOpen
                    ? "border-2 border-green-500"
                    : event.is_active
                    ? "border-2 border-red-500"
                    : "border-2 border-amber-400"
                }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                {!event.is_active && (
                  <div className="absolute inset-0 bg-amber-50/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <Badge className="absolute top-4 left-4 flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
                      <CircleCheck className="w-4 h-4" />
                      Completed Event
                    </Badge>
                  </div>
                )}
                {event.is_active && expired && (
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="flex items-center gap-1 bg-red-500 hover:bg-red-600">
                      <Clock className="w-4 h-4" />
                      Registration Closed
                    </Badge>
                  </div>
                )}
                <img
                  src={event.image_url}
                  alt={event.title}
                  className={`w-full h-48 object-cover transition-transform duration-300 
                    ${
                      isExternal
                        ? "group-hover:scale-105"
                        : registrationOpen
                        ? "group-hover:scale-105"
                        : "filter sepia brightness-90"
                    }`}
                />
                {/* {isExternal && (
                  // <Badge className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-blue-500 hover:bg-blue-600">
                  //   <ExternalLink className="w-4 h-4" />
                  //   External Event
                  // </Badge>
                )} */}
                <Badge
                  className="absolute top-4 right-4 z-20"
                  variant="secondary"
                >
                  {event.interest}
                </Badge>
              </div>

              <Link
                href={
                  isExternal
                    ? `external-event/${event.id}` || "#"
                    : registrationOpen
                    ? `/events/${event.id}`
                    : "#"
                }
              >
                <CardHeader className="space-y-2">
                  <h3
                    className={`text-xl font-bold leading-tight line-clamp-2 flex items-center 
                    ${
                      isExternal
                        ? "text-blue-700"
                        : registrationOpen
                        ? ""
                        : event.is_active
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}
                  >
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {event.description}
                  </p>
                </CardHeader>
              </Link>

              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        isExternal
                          ? "text-blue-600"
                          : registrationOpen
                          ? "text-primary"
                          : event.is_active
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                    <span
                      className={
                        isExternal
                          ? "text-blue-700"
                          : registrationOpen
                          ? ""
                          : event.is_active
                          ? "text-red-700"
                          : "text-amber-700"
                      }
                    >
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin
                      className={`w-4 h-4 ${
                        isExternal
                          ? "text-blue-600"
                          : registrationOpen
                          ? "text-primary"
                          : event.is_active
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                    <span
                      className={
                        isExternal
                          ? "text-blue-700"
                          : registrationOpen
                          ? ""
                          : event.is_active
                          ? "text-red-700"
                          : "text-amber-700"
                      }
                    >
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag
                      className={`w-4 h-4 ${
                        isExternal
                          ? "text-blue-600"
                          : registrationOpen
                          ? "text-primary"
                          : event.is_active
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                    <span
                      className={
                        isExternal
                          ? "text-blue-700"
                          : registrationOpen
                          ? ""
                          : event.is_active
                          ? "text-red-700"
                          : "text-amber-700"
                      }
                    >
                      {event.interest}
                    </span>
                  </div>

                  {/* Deadline timer for both internal and external events */}
                  {event.is_active && event.registration_deadline && (
                    <div className="flex items-center gap-2 mt-3">
                      <Clock
                        className={`w-4 h-4 ${
                          expired
                            ? "text-red-600"
                            : isExternal
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          expired
                            ? "text-red-600"
                            : isExternal
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {timeString}
                      </span>
                    </div>
                  )}

                  {isExternal && event.organizer && (
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-muted-foreground">Organizer:</span>
                      <span className="text-blue-700 font-medium">
                        {event.organizer}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {isExternal ? (
                  <Button
                    className="w-full group/button bg-blue-600 hover:bg-blue-700"
                    asChild
                    variant="default"
                    disabled={expired}
                  >
                    <Link
                      href={`external-event/${event.id}` || "#"}
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      {expired ? "Registration Closed" : "Visit Event"}{" "}
                      {!expired && <ExternalLink className="w-4 h-4" />}
                    </Link>
                  </Button>
                ) : registrationOpen ? (
                  <Button
                    className="w-full group/button"
                    asChild
                    variant="default"
                  >
                    <Link
                      href={`/events/${event.id}/register`}
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Apply Now
                    </Link>
                  </Button>
                ) : event.is_active ? (
                  <Button className="w-full" disabled variant="secondary">
                    Registration Closed
                  </Button>
                ) : (
                  <Button className="w-full" disabled variant="secondary">
                    Event Completed
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {eventType === "external"
            ? "No external events found. Check back later for upcoming opportunities."
            : "No events found for the selected filter."}
        </div>
      )}
    </div>
  );
}
