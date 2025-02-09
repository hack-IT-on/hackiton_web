import { getCurrentUser } from "@/lib/getCurrentUser";
import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    const { problemId } = params; // Correctly destructure the parameter

    const [response] = await connection.execute(
      "SELECT * FROM `submissions` WHERE user_id = ? AND problem_id = ? order by id desc",
      [user.id, problemId]
    );

    return NextResponse.json(response);
  } catch (err) {
    // It's better to return an error status code
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
