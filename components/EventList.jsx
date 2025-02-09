import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EventList({ events }) {
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

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <Badge className="absolute top-4 right-4 z-20" variant="secondary">
              {event.interest}
            </Badge>
          </div>

          <Link href={`/events/${event.id}`}>
            <CardHeader className="space-y-2">
              <h3 className="text-xl font-bold leading-tight line-clamp-2">
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
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span>{event.interest}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full group/button" asChild>
              <Link
                href={`/events/${event.id}/register`}
                // target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                Apply Now
                <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200 group-hover/button:opacity-100 group-hover/button:translate-x-0" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
