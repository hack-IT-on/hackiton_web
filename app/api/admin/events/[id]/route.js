import { connection } from "@/util/db";
import { NextResponse } from "next/server";
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(body);
    const { title, description, image_url, date, location, interest } = body;
    // console.log(title);

    await connection.execute(
      `UPDATE events 
          SET title = ?, description = ?, image_url = ?, 
              date = ?, location = ?, interest = ?
          WHERE id = ?`,
      [title, description, image_url, date, location, interest, id]
    );

    return NextResponse.json({ message: "Event updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connection.execute(
      "UPDATE events SET is_active = false WHERE id = ?",
      [id]
    );

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
