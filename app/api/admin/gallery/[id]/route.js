import { connection } from "@/util/db";
import { NextResponse } from "next/server";

// Helper function to get image by ID
async function getImageById(id) {
  const [rows] = await connection.execute(
    "SELECT * FROM gallery WHERE id = ?",
    [id]
  );
  return rows[0];
}

export async function DELETE(request, { params }) {
  try {
    // const image = await getImageById(params.id);

    await connection.execute("DELETE FROM gallery WHERE id = ?", [params.id]);

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const image = await getImageById(params.id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, tags } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connection.execute(
      "UPDATE gallery SET title = ?, tags = ? WHERE id = ?",
      [title, tags, params.id]
    );

    return NextResponse.json({
      message: "Image updated successfully",
      image: { ...image, title, tags },
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}
