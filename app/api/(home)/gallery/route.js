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

    if (fromDate) {
      conditions.push("uploaded_at >= ?");
      params.push(fromDate);
    }
    if (toDate) {
      conditions.push("uploaded_at <= ?");
      params.push(toDate);
    }
    if (tags && tags.length > 0) {
      const tagConditions = tags.map((tag) => {
        params.push(`%${tag}%`);
        return "tags LIKE ?";
      });
      conditions.push(`(${tagConditions.join(" AND ")})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const [rows] = await connection.execute(query, params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
