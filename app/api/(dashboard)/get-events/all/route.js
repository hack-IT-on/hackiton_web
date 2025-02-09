import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { NextResponse } from "next/server";
export async function GET() {
  const user = await getCurrentUser();
  try {
    const [response] = await connection.execute(
      "select * from events where is_active = 1 order by id desc limit 2"
    );
    return NextResponse.json(response);
  } catch (err) {
    console.log(err);
  }
}
