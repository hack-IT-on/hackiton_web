import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  try {
    const response = await connection.query(
      "SELECT * FROM user_badges WHERE user_id = $1",
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
