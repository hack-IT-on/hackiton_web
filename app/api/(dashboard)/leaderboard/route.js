import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all-time";

  let query = `
    SELECT u.name, u.id, u.email, u.total_points, COUNT(DISTINCT ub.badge_id) as badge_count
    FROM users u
    LEFT JOIN user_badges ub ON u.id = ub.user_id
  `;

  if (period === "weekly") {
    query += ` WHERE date_trunc('week', u.points_created_at) = date_trunc('week', CURRENT_DATE)`;
  } else if (period === "monthly") {
    query += ` WHERE date_trunc('month', u.points_created_at) = date_trunc('month', CURRENT_DATE)`;
  }

  query += ` GROUP BY u.id, u.name, u.email, u.total_points ORDER BY u.total_points DESC LIMIT 100`;

  try {
    const result = await connection.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    // console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
