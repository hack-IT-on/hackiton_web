import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await connection.query(
      "SELECT * FROM gallery ORDER BY id DESC"
    );

    return NextResponse.json(rows.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
