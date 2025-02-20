import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connection.execute("DELETE FROM `event_certificates` WHERE id = ?", [
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
    const { id } = await params;
    const body = await request.json();
    console.log(body);
    const {
      title,
      description,
      long_description,
      image_url,
      date,
      location,
      interest,
      is_active,
    } = body;
    // console.log(title);

    await connection.execute(
      `UPDATE events 
            SET title = ?, description = ?, long_description = ?, image_url = ?,
                date = ?, location = ?, interest = ?, is_active = ?
            WHERE id = ?`,
      [
        title,
        description,
        long_description,
        image_url,
        date,
        location,
        interest,
        is_active,
        id,
      ]
    );

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
