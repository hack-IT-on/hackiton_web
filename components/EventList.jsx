import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function EventList({ events }) {
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

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
    const ampm = hours >= 12 ? "AM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
  };

  const filteredEvents = events.filter((event) => {
    if (statusFilter === "active") return event.is_active;
    if (statusFilter === "inactive") return !event.is_active;
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
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
          Inactive
        </Button>

        {/* Event count badge */}
        <Badge variant="secondary" className="ml-2">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"}
        </Badge>
      </div>

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className={`group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl
              ${
                event.is_active
                  ? "border-2 border-green-500"
                  : "border-2 border-red-200"
              }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              {!event.is_active && (
                <div className="absolute inset-0 bg-gray-200/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                  <Badge
                    variant="destructive"
                    className="absolute top-4 left-4 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Inactive Event
                  </Badge>
                </div>
              )}
              <img
                src={event.image_url}
                alt={event.title}
                className={`w-full h-48 object-cover transition-transform duration-300 
                  ${
                    event.is_active
                      ? "group-hover:scale-105"
                      : "filter grayscale"
                  }`}
              />
              <Badge
                className="absolute top-4 right-4 z-20"
                variant="secondary"
              >
                {event.interest}
              </Badge>
            </div>

            <Link href={event.is_active ? `/events/${event.id}` : "#"}>
              <CardHeader className="space-y-2">
                <h3
                  className={`text-xl font-bold leading-tight line-clamp-2 
                  ${event.is_active ? "" : "text-gray-500"}`}
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
                      event.is_active ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <span className={event.is_active ? "" : "text-gray-500"}>
                    {formatDate(event.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className={`w-4 h-4 ${
                      event.is_active ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <span className={event.is_active ? "" : "text-gray-500"}>
                    {event.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag
                    className={`w-4 h-4 ${
                      event.is_active ? "text-primary" : "text-gray-400"
                    }`}
                  />
                  <span className={event.is_active ? "" : "text-gray-500"}>
                    {event.interest}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full group/button"
                asChild
                disabled={!event.is_active}
                variant={event.is_active ? "default" : "secondary"}
              >
                <Link
                  href={event.is_active ? `/events/${event.id}/register` : "#"}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                  onClick={(e) => !event.is_active && e.preventDefault()}
                >
                  {event.is_active ? "Apply Now" : "Registration Closed"}
                  {/* {event.is_active && (
                    <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover/button:opacity-100 group-hover/button:translate-x-0" />
                  )} */}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No events found for the selected filter.
        </div>
      )}
    </div>
  );
}
