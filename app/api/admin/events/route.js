import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    // Use consistent filtering across both queries
    const [events] = await connection.execute(
      "SELECT * FROM events ORDER BY id DESC"
    );

    const [[{ count }]] = await connection.execute(
      "SELECT COUNT(*) as count FROM events WHERE is_active = 1"
    );

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

    const result = await connection.execute(
      `
        INSERT INTO events (title, description, image_url, date, location, interest)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [title, description, image_url, date, location, interest]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
