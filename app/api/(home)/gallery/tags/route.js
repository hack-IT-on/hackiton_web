// app/api/gallery/tags/route.ts
import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET() {
  try {
    // Simpler query to get unique tags using string functions
    const [rows] = await connection.execute(`
      SELECT DISTINCT 
        TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1)) as tag
      FROM
        gallery
        CROSS JOIN (
          SELECT 1 AS n UNION ALL
          SELECT 2 UNION ALL
          SELECT 3 UNION ALL
          SELECT 4 UNION ALL
          SELECT 5
        ) numbers
      WHERE
        CHAR_LENGTH(tags) - CHAR_LENGTH(REPLACE(tags, ',', '')) >= numbers.n - 1
        AND TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', numbers.n), ',', -1)) != ''
      ORDER BY tag
    `);

    // Extract just the tag names into an array
    const tags = rows.map((row) => row.tag);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
