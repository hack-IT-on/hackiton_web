import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const response = await connection.query(
      "SELECT * FROM events WHERE is_active = 1 ORDER BY id DESC LIMIT 2"
    );
    return NextResponse.json(response.rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
