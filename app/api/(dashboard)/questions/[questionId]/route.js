import { NextResponse } from "next/server";
import { connection } from "@/util/db";

// Handle GET request
export async function GET(request, { params }) {
  const { questionId } = await params;
  // console.log(questionId);

  // Example: Fetch question details from a database
  const question = await connection.query(
    "SELECT questions.*, users.name AS user_name FROM questions JOIN users ON questions.user_id = users.id WHERE questions.id = $1",
    [questionId]
  );

  // return NextResponse.json(questions);

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question.rows);
}
