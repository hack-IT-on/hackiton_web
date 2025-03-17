import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET() {
  try {
    const result = await connection.query(`
      SELECT DISTINCT
        TRIM(tag) as tag
      FROM
        gallery,
        LATERAL unnest(string_to_array(tags, ',')) as tag
      WHERE
        TRIM(tag) != ''
      ORDER BY tag
    `);

    // Extract just the tag names into an array
    const tags = result.rows.map((row) => row.tag);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
