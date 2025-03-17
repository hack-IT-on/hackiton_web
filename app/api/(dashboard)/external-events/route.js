import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET() {
  try {
    const query = `
      SELECT 
        id, 
        title, 
        description, 
        date, 
        registration_deadline, 
        location, 
        interest, 
        image_url, 
        registration_link, 
        organizer,
        is_active
      FROM external_events
      ORDER BY id DESC
    `;

    const result = await connection.query(query);

    const formattedEvents = result.rows.map((event) => ({
      ...event,
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
      registration_deadline:
        event.registration_deadline instanceof Date
          ? event.registration_deadline.toISOString()
          : event.registration_deadline,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch external events" },
      { status: 500 }
    );
  }
}
