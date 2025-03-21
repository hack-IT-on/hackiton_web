import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    const certificates = await connection.query(
      `
        SELECT * FROM event_certificates 
        ORDER BY id DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const totalCount = await connection.query(
      "SELECT COUNT(*) as count FROM event_certificates"
    );

    return NextResponse.json({
      certificates: certificates.rows,
      total: parseInt(totalCount.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const event_id = formData.get("event_id");
    const certificate_issue_date = formData.get("certificate_issue_date");
    const template_url = formData.get("template_url");

    // Save to database
    const result = await connection.query(
      `
        INSERT INTO event_certificates (name, event_id, certificate_issue_date, template_url)
        VALUES ($1, $2, $3, $4)
      `,
      [name, event_id, certificate_issue_date, template_url]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        template_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
