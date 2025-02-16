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
    console.log(body);
    console.log(Date(body.date).toString().slice(0, 19).replace("T", " "));

    const requiredFields = ["title", "description", "date", "location"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const result = await connection.execute(
      `INSERT INTO events (
        title, description, long_description, image_url, 
        date, location, interest, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title,
        body.description,
        body.long_description,
        body.image_url,
        body.date,
        body.location,
        body.interest,
        user.id,
      ]
    );

    return NextResponse.json({ success: true, result: result[0] });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
