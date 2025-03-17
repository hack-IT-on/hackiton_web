import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all-time";

  let query = `
          SELECT u.name,u.id, u.total_points, COUNT(DISTINCT ub.badge_id) as badge_count
          FROM users u
          LEFT JOIN user_badges ub ON u.id = ub.user_id
      `;

  if (period === "weekly") {
    query += ` WHERE YEARWEEK(u.points_created_at) = YEARWEEK(NOW())`;
  } else if (period === "monthly") {
    query += ` WHERE MONTH(u.points_created_at) = MONTH(NOW()) AND YEAR(u.points_created_at) = YEAR(NOW())`;
  }
  query += ` GROUP BY u.id ORDER BY u.total_points DESC LIMIT 100`;
  try {
    const leaderboard = await connection.query(query);
    return NextResponse.json(leaderboard.rows);
  } catch (error) {
    // console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
