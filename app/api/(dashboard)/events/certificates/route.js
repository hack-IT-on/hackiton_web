import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const [certificates] = await connection.execute(
      "SELECT ec.*, er.user_name, er.email, er.check_in_time FROM event_registrations er JOIN event_certificates ec ON er.event_id = ec.event_id WHERE er.is_checked_in = 1 AND er.is_checked_out = 1 AND er.user_id = ?",
      [user.id]
    );
    return NextResponse.json({ certificates });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
