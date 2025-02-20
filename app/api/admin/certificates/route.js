import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    const [certificates] = await connection.execute(
      `
        SELECT * FROM event_certificates 
        ORDER BY id DESC 
        LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );

    const totalCount = await connection.execute(
      "SELECT COUNT(*) as count FROM event_certificates"
    );

    return NextResponse.json({
      certificates,
      total: totalCount[0].count,
      page,
      totalPages: Math.ceil(totalCount[0].count / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, event_id, certificate_issue_date, template_url } = body;

    const result = await connection.execute(
      `
        INSERT INTO event_certificates (name, event_id, certificate_issue_date, template_url)
        VALUES (?, ?, ?, ?)
      `,
      [name, event_id, certificate_issue_date, template_url]
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
