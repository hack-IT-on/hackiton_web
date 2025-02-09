import { NextResponse } from "next/server";
import { connection } from "@/util/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { message: "Invalid verification token" },
      { status: 400 }
    );
  }

  try {
    // Find user with matching token that hasn't expired
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE verification_token = ? AND token_expiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired verification token" },
        { status: 404 }
      );
    }

    // Update user as verified
    await connection.execute(
      "UPDATE users SET is_verified = true, verification_token = NULL, token_expiry = NULL WHERE verification_token = ?",
      [token]
    );

    return NextResponse.json(
      { message: "Email verified successfully" },
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
