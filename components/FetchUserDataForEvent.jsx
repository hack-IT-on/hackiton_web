import { getCurrentUser } from "@/lib/getCurrentUser";
import EventRegistrationForm from "./EventRegistrationForm";

export default async function FetchUserDataForEvent({ eventId, eventData }) {
  const user = await getCurrentUser();
  return <EventRegistrationForm eventId={eventId} eventData={eventData} />;
}
