import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request, { params }) {
  const { id } = await params;

  const response = await connection.query(
    "SELECT * FROM external_events WHERE id = $1",
    [id]
  );

  if (response.rows.length === 0) {
    return NextResponse.json({ error: "event not found" }, { status: 404 });
  }

  return NextResponse.json(response.rows[0]);
}
