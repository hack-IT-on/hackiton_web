import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const response = await connection.query(
      "SELECT * FROM events WHERE id = $1",
      [id]
    );

    if (response.rows.length === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(response.rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
