import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { rollNo } = body;

    if (!rollNo) {
      return NextResponse.json(
        { message: "Roll number is required" },
        { status: 400 }
      );
    }

    const [rows] = await connection.execute(
      `SELECT name 
      FROM students 
      WHERE roll_no = ?`,
      [rollNo]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ name: rows[0].name }, { status: 200 });
  } catch (error) {
    console.error("Error verifying student:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
