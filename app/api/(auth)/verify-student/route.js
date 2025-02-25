import { connection } from "@/util/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, studentID } = body;

    if (!studentID) {
      return NextResponse.json(
        { message: "Roll number is required" },
        { status: 400 }
      );
    }

    const [rows] = await connection.execute(
      `SELECT mobile_number 
      FROM students 
      WHERE name = ? and roll_no = ?`,
      [name, studentID]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { mobile_number: rows[0].mobile_number },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying student:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
