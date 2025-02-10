import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET() {
  const [response] = await connection.execute(
    "select * from events where is_active = 1 order by id desc limit 3"
  );
  return NextResponse.json(response);
}
