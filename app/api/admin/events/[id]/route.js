import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const result = await connection.query(
      "SELECT title FROM events WHERE id = $1",
      [params.id]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ name: result.rows[0].title });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log(body);
    const {
      title,
      description,
      long_description,
      image_url,
      date,
      registration_deadline,
      location,
      interest,
      is_active,
    } = body;

    await connection.query(
      `UPDATE events 
          SET title = $1, description = $2, long_description = $3, image_url = $4,
              date = $5, registration_deadline = $6, location = $7, interest = $8, is_active = $9
          WHERE id = $10`,
      [
        title,
        description,
        long_description,
        image_url,
        date,
        registration_deadline,
        location,
        interest,
        is_active,
        id,
      ]
    );

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await connection.query("DELETE FROM events WHERE id = $1", [id]);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
