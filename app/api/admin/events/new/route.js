import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // PostgreSQL insertion
    const result = await connection.query(
      `INSERT INTO events (
        title, description, long_description, image_url, 
        date, registration_deadline, location, interest, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        body.title,
        body.description,
        body.long_description || "",
        body.image_url,
        body.date,
        body.registration_deadline,
        body.location,
        body.interest || null,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      result: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
