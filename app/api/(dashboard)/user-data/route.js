import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { connection } from "@/util/db";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [userData] = await connection.execute(
      "select name, email, student_id, github_username, total_points, code_coins, role from users where id = ?",
      [user?.id]
    );
    return NextResponse.json(userData[0]);
  } catch (err) {
    console.log(err);
  }
}
