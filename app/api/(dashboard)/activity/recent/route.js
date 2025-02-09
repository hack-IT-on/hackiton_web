import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "SELECT a.*,ua.name, ua.created_at FROM user_activities ua JOIN activities a ON ua.activity_id = a.id WHERE ua.user_id = ? ORDER BY ua.created_at DESC limit 5",
      [user.id]
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
