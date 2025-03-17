import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(req) {
  try {
    const user = await getCurrentUser();
    console.log(`username hii: ${user.github_username}`);
    const { userId, githubUsername } = await req.json();
    // console.log(githubUsername);

    // PostgreSQL query with $1, $2 parameters instead of ?
    await connection.query(
      "UPDATE users SET github_username = $1 WHERE id = $2",
      [githubUsername, userId]
    );

    return NextResponse.json(
      { message: "GitHub username updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating GitHub username:", error);
    return NextResponse.json(
      { error: "Failed to update GitHub username" },
      { status: 500 }
    );
  }
}
