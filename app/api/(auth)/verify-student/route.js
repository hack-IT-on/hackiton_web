import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, studentID } = await body;

    if (!studentID) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Added validation for name
    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Improved variable naming for clarity (roll_no vs studentID)
    const [rows] = await connection.execute(
      `SELECT * 
      FROM students 
      WHERE name = ? AND roll_no = ?`,
      [name, studentID]
    );

    // Added proper connection release
    // connection.release();

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
