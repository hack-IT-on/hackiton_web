import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function POST(req) {
  try {
    // const user = await getCurrentUser();
    const { userId, leetcodeUsername } = await req.json();
    await connection.query(
      "UPDATE users SET leetcode_username = $1 WHERE id = $2",
      [leetcodeUsername, userId]
    );

    return NextResponse.json(
      { message: "LeetCode username updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating LeetCode username:", error);
    return NextResponse.json(
      { error: "Failed to update LeetCode username" },
      { status: 500 }
    );
  }
}
