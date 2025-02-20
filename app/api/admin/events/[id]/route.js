import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET(request, { params }) {
  try {
    const [rows] = await connection.execute(
      "SELECT title FROM events WHERE id = ?",
      [params.id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ name: rows[0].title });
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
    const { id } = await params;
    const body = await request.json();
    console.log(body);
    const {
      title,
      description,
      long_description,
      image_url,
      date,
      location,
      interest,
      is_active,
    } = body;
    // console.log(title);

    await connection.execute(
      `UPDATE events 
          SET title = ?, description = ?, long_description = ?, image_url = ?,
              date = ?, location = ?, interest = ?, is_active = ?
          WHERE id = ?`,
      [
        title,
        description,
        long_description,
        image_url,
        date,
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
    const { id } = await params;

    await connection.execute("DELETE FROM `events` WHERE id = ?", [id]);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
