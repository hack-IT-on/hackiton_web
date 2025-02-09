"use client";

import { useState } from "react";
import EventList from "./EventList";
import EventFilter from "./EventFilter";
import { Loader2 } from "lucide-react";

export default function EventsClient({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);

  const handleFilter = async (filters) => {
    const queryParams = new URLSearchParams();

    if (filters.startDate) queryParams.set("startDate", filters.startDate);
    if (filters.endDate) queryParams.set("endDate", filters.endDate);
    if (filters.interest) queryParams.set("interest", filters.interest);

    try {
      setLoading(true);
      const response = await fetch(`/api/events?${queryParams}`);
      const filteredEvents = await response.json();
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      <EventFilter onFilter={handleFilter} />
      <EventList events={events} />
    </div>
  );
}
