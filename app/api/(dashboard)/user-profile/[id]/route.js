import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate that ID exists and is valid
    if (!id) {
      return NextResponse.json(
        { error: "Missing user ID parameter" },
        { status: 400 }
      );
    }

    // Query to get user data
    const userData = await connection.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    // Check if any user was found
    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Query to get badges data separately
    const badgesData = await connection.query(
      "SELECT b.* FROM badges b JOIN user_badges ub ON b.id = ub.badge_id WHERE ub.user_id = $1",
      [id]
    );

    // Return both sets of data separately
    return NextResponse.json({
      user: userData.rows[0],
      badges: badgesData.rows,
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
