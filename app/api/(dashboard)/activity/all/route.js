import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const result = await connection.query(
      "SELECT a.*, ua.name, ua.created_at FROM user_activities ua JOIN activities a ON ua.activity_id = a.id WHERE ua.user_id = $1 ORDER BY ua.created_at DESC LIMIT 50",
      [user?.id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Error fetching user activity details" },
      { status: 500 }
    );
  }
}
