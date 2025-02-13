import { getEvents } from "@/lib/eventUtils";
import EventsClient from "@/components/EventsClient";

export default async function EventsPage() {
  const initialEvents = await getEvents();
  return <EventsClient initialEvents={initialEvents} />;
}
