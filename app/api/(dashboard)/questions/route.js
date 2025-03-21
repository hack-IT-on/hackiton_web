import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request) {
  const user = getCurrentUser();
  // if (user.role !== "admin") {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  // }

  const questions = await connection.query(
    "SELECT questions.*, users.name AS user_name FROM questions JOIN users ON questions.user_id = users.id WHERE questions.status = 'approved' order by id desc"
  );

  return NextResponse.json(questions.rows);
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user?.id) {
      throw new Error("User is not authenticated.");
    }

    const body = await request.json();

    if (!body.title || !body.content || !body.tags) {
      throw new Error("Title, content, and tags are required.");
    }

    // Ensure tags are a string
    const tags = Array.isArray(body.tags) ? body.tags.join(",") : body.tags;

    // Execute the query
    const response = await connection.query(
      "INSERT INTO questions(user_id, title, content, tags) VALUES ($1, $2, $3, $4)",
      [user?.id, body.title, body.content, tags]
    );

    return new Response(
      JSON.stringify({ message: "Question added successfully.", response }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding question:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const user = getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { questionId, status } = await request.json();

  await connection.query(
    "UPDATE questions SET status = $1, approved_at = NOW() WHERE id = $2",
    [status, questionId]
  );

  return NextResponse.json({ message: "Question updated" });
}
