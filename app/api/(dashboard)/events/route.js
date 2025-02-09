import { NextResponse } from "next/server";
import { createEvent, getEvents } from "@/lib/eventUtils";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
    interest: searchParams.get("interest"),
  };

  const events = await getEvents(filters);
  return NextResponse.json(events);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const eventData = await request.json();
  eventData.user_id = user?.id;

  try {
    const eventId = await createEvent(eventData);
    return NextResponse.json({ id: eventId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating event" },
      { status: 500 }
    );
  }
}
