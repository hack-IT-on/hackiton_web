import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    const [events] = await connection.execute(
      `SELECT * FROM events 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const totalCount = await connection.execute(
      "SELECT COUNT(*) as count FROM events WHERE is_active = 1"
    );

    return NextResponse.json({
      events,
      total: totalCount[0].count,
      page,
      totalPages: Math.ceil(totalCount[0].count / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
