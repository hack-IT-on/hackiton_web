import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
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
        { message: "User not found or not verified" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        student_id: user?.student_id,
        github_username: user?.github_username,
        leetcode_username: user?.leetcode_username,
        role: user?.role,
        upload_project: user?.upload_project,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          student_id: user?.student_id,
          github_username: user?.github_username,
          leetcode_username: user?.leetcode_username,
          role: user?.role,
          upload_project: user?.upload_project,
        },
      },
      { status: 200 }
    );

    // Set secure httpOnly cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 72000, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
