import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "SELECT DATE(created_at) AS date, DAYNAME(created_at) AS day_name, COUNT(*) AS count, user_id FROM user_activities WHERE user_id = ? AND created_at >= CURDATE() - INTERVAL 6 DAY GROUP BY DATE(created_at) ORDER BY DATE(created_at)",
      [user.id]
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
