import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "select * from projects where user_id = ?",
      [user?.id]
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
