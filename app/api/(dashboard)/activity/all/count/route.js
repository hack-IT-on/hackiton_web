import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const result = await connection.query(
      "SELECT * FROM user_activities WHERE user_id = $1",
      [user?.id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.log(err);
    // Added error response
    return NextResponse.json(
      { message: "Error fetching user activities" },
      { status: 500 }
    );
  }
}
