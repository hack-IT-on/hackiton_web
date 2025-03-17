import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await connection.query("DELETE FROM event_certificates WHERE id = $1", [
      id,
    ]);

    return NextResponse.json({
      message: "Event certificate deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const name = formData.get("name");
    const event_id = formData.get("event_id");
    const certificate_issue_date = formData.get("certificate_issue_date");
    const template_url = formData.get("template_url");

    // Update database
    await connection.query(
      `UPDATE event_certificates
        SET name = $1, event_id = $2, certificate_issue_date = $3, template_url = $4
        WHERE id = $5`,
      [name, event_id, certificate_issue_date, template_url, id]
    );

    return NextResponse.json({
      message: "Certificate updated successfully",
      template_url,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
