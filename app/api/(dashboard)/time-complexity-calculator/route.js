import { NextResponse } from "next/server";
import { analyzeComplexity } from "@/lib/analyze-complexity";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid code input" },
        { status: 400 }
      );
    }

    const result = analyzeComplexity(code);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing code:", error);

    return NextResponse.json(
      { error: "Failed to analyze code: " + error.message },
      { status: 500 }
    );
  }
}
