// app/api/problems/route.js
import { connection } from "@/util/db";
import { NextResponse } from "next/server";
import { LeetCode } from "leetcode-query";

export async function GET() {
  try {
    // const problems = await connection.execute(
    //   "SELECT id, title, difficulty, category, (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE problem_id = problems.id AND status = 'Accepted') as solved_count FROM problems ORDER BY id DESC"
    // );

    const leetcode = new LeetCode();
    // const user = await leetcode.user("dipakbiswa");
    const problems = await leetcode.problems();

    return NextResponse.json(problems.questions);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
