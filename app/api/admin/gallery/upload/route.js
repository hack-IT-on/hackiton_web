import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const tags = formData.get("tags");
    const imageUrl = formData.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    try {
      new URL(imageUrl);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    try {
      const result = await connection.query(
        "INSERT INTO gallery (title, tags, url) VALUES ($1, $2, $3)",
        [title, tags || null, imageUrl]
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
