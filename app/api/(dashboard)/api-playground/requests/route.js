import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "anonymous";

  try {
    const result = await connection.query(
      "SELECT * FROM requests WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json({ requests: result.rows });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const data = await request.json();
  const {
    userId = "anonymous",
    method,
    url,
    headers,
    body,
    queryParams,
    responseStatus,
    responseBody,
  } = data;

  try {
    const result = await connection.query(
      `INSERT INTO requests (user_id, method, url, headers, body, query_params, response_status, response_body)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        method,
        url,
        headers,
        body,
        queryParams,
        responseStatus,
        responseBody,
      ]
    );

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error("Error saving request:", error);
    return NextResponse.json(
      { error: "Failed to save request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Request ID is required" },
      { status: 400 }
    );
  }

  try {
    await connection.query("DELETE FROM requests WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
