import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function GET() {
  const [response] = await connection.execute(
    "select * from questions order by id desc"
  );
  return NextResponse.json(response);
}
