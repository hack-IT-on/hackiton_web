import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";

export async function POST(request) {
  try {
    const {
      name,
      studentID,
      githubUsername,
      leetcodeUsername,
      email,
      password,
      cpassword,
    } = await request.json();

    // Validate input
    if (
      !name ||
      !studentID ||
      !githubUsername ||
      !leetcodeUsername ||
      !email ||
      !password ||
      !cpassword
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== cpassword) {
      return NextResponse.json(
        { message: "Password and confirm password is not matched!" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ? or student_id = ?",
      [email, studentID]
    );

    const [existingStudent] = await connection.execute(
      "SELECT mobile_number FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );

    if (existingStudent.length == 0) {
      return NextResponse.json(
        { message: `Name and roll number do not match.` },
        { status: 409 }
      );
    }

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email or roll no. already exists" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with verification details
    const insertQuery = await connection.execute(
      "INSERT INTO users (email, name, student_id, github_username, leetcode_username, password, verification_token, token_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        name,
        studentID,
        githubUsername,
        leetcodeUsername,
        hashedPassword,
        verificationToken,
        tokenExpiry,
        false,
      ]
    );

    // Send verification email
    const sendMail = await sendVerificationEmail(email, verificationToken);

    // await connection.end();
    if (insertQuery && sendMail) {
      return NextResponse.json(
        { message: "User registered successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to register user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
