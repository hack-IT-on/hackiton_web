import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "SELECT b.* FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ?",
      [user.id]
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
