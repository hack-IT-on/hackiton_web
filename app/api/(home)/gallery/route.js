import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const tags = searchParams.get("tags")?.split(",");

    let query = "SELECT * FROM gallery";
    const params = [];
    const conditions = [];
    let paramIndex = 1; // PostgreSQL uses $1, $2, etc. for parameter placeholders

    if (fromDate) {
      conditions.push(`uploaded_at >= $${paramIndex}`);
      params.push(fromDate);
      paramIndex++;
    }
    if (toDate) {
      conditions.push(`uploaded_at <= $${paramIndex}`);
      params.push(toDate);
      paramIndex++;
    }
    if (tags && tags.length > 0) {
      const tagConditions = tags.map((tag) => {
        params.push(`%${tag}%`);
        return `tags LIKE $${paramIndex++}`;
      });
      conditions.push(`(${tagConditions.join(" AND ")})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const result = await connection.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
