import { NextResponse } from "next/server";
import { connection } from "@/util/db";
export async function GET(request, { params }) {
  const { id } = params;
  const [response] = await connection.execute(
    "select * from events where id = ?",
    [id]
  );

  if (!response) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }
  return NextResponse.json(response);
}
