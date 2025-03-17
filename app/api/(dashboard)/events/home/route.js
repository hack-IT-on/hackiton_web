import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await connection.query(
    "SELECT * FROM events WHERE is_active = 1 ORDER BY id DESC LIMIT 3"
  );

  return NextResponse.json(response.rows);
}
