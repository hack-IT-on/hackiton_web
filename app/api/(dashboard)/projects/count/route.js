import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const response = await connection.query(
      "select * from projects where user_id = $1",
      [user?.id]
    );
    return NextResponse.json(response.rows);
  } catch (err) {
    console.log(err);
  }
}
