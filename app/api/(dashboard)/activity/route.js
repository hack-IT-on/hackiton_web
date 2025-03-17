import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();

  try {
    const response = await connection.query(
      `SELECT 
        DATE(created_at) AS date, 
        TO_CHAR(created_at, 'Day') AS day_name, 
        COUNT(*) AS count, 
        user_id 
      FROM user_activities 
      WHERE user_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '6 days' 
      GROUP BY DATE(created_at), TO_CHAR(created_at, 'Day'), user_id 
      ORDER BY DATE(created_at)`,
      [user?.id]
    );

    return NextResponse.json(response.rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch activity stats" },
      { status: 500 }
    );
  }
}
