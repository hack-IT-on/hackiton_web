import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();

  try {
    const response = await connection.query(
      "SELECT b.* FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = $1",
      [user?.id]
    );

    return NextResponse.json(response.rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch user badges" },
      { status: 500 }
    );
  }
}
