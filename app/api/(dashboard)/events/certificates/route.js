import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    const certificatesResult = await connection.query(
      "SELECT ec.*, er.user_name, er.email, er.check_in_time FROM event_registrations er JOIN event_certificates ec ON er.event_id = ec.event_id WHERE er.is_checked_in = true AND er.is_checked_out = 1 AND er.user_id = $1",
      [user.id]
    );

    return NextResponse.json({ certificates: certificatesResult.rows });
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
