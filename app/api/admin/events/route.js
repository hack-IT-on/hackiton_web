import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get events with pagination
    const eventsResult = await connection.query(
      "SELECT * FROM events ORDER BY id DESC"
    );
    const events = eventsResult.rows;

    // Get total count
    const countResult = await connection.query(
      "SELECT COUNT(*) as count FROM events WHERE is_active = 1"
    );
    const count = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      events,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching events" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, image_url, date, location, interest } = body;

    const result = await connection.query(
      `
        INSERT INTO events (title, description, image_url, date, location, interest)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [title, description, image_url, date, location, interest]
    );

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
