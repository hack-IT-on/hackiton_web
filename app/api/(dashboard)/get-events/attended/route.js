import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "SELECT e.*, er.user_id FROM events e JOIN event_registrations er ON e.id = er.event_id WHERE er.is_checked_in = 1 and er.user_id = ? order by id desc",
      [user.id]
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
