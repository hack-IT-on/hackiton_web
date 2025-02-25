import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function POST(request) {
  const { studentID, otp } = await request.json();

  try {
    // Find user with matching token that hasn't expired
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE student_id = ? AND otp = ?",
      [studentID, otp]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 404 });
    }

    // Update user as verified
    await connection.execute(
      "UPDATE users SET is_phone_verified = true WHERE student_id = ? and otp = ?",
      [studentID, otp]
    );

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
