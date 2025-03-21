import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req, { params }) {
  const { questionId } = await params;

  const question = await connection.query(
    "SELECT answers.*, users.name AS user_name FROM answers JOIN users ON answers.user_id = users.id WHERE answers.question_id = $1 order by answers.id desc",
    [questionId]
  );

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json(question.rows);
}

export async function POST(req, { params }) {
  try {
    const { questionId } = params;
    const body = await req.json();

    const user = await getCurrentUser();

    if (!questionId) {
      throw new Error("Question ID is required.");
    }
    if (!user || !user?.id) {
      throw new Error("User is not authenticated.");
    }
    if (!body.content) {
      throw new Error("Answer content is required.");
    }

    // Execute SQL query
    const result = await connection.query(
      "INSERT INTO answers(question_id, user_id, content) VALUES ($1, $2, $3)",
      [questionId, user?.id, body.content]
    );

    return NextResponse.json({
      message: "Answer added successfully.",
      answerId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding answer:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
