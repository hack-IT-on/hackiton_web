import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET() {
  const response = await connection.query(
    "select * from events where is_active = 1 order by id desc"
  );
  return NextResponse.json(response.rows);
}
