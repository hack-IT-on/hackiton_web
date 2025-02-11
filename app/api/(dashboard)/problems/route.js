import { NextResponse } from "next/server";
import { LeetCode } from "leetcode-query";

export async function GET() {
  try {
    const leetcode = new LeetCode();
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
