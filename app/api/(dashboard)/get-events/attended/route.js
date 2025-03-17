import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const response = await connection.query(
      "SELECT e.*, er.user_id FROM events e JOIN event_registrations er ON e.id = er.event_id WHERE er.is_checked_in = true AND er.is_checked_out = 1 AND er.user_id = $1 ORDER BY id DESC",
      [user?.id]
    );
    return NextResponse.json(response.rows);
  } catch (err) {
    console.log("an error: ");
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch completed events" },
      { status: 500 }
    );
  }
}
