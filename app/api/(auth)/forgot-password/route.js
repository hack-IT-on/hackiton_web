import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ? AND is_verified = true",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No verified account found with this email" },
        { status: 404 }
      );
    }

    // Generate password reset token
    const resetToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await connection.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [resetToken, tokenExpiry, email]
    );

    // Send password reset email
    await sendVerificationEmail(
      email,
      resetToken,
      "Reset Your Password",
      "/reset-password"
    );

    return NextResponse.json(
      { message: "Password reset link sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
