import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";

export async function POST(request) {
  try {
    const { name, studentID, email, password, cpassword } =
      await request.json();

    // Validate input
    if (!name || !studentID || !email || !password || !cpassword) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== cpassword) {
      return NextResponse.json(
        { message: "Password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Check if student exists and get their email - case insensitive name search
    const studentResult = await connection.query(
      "SELECT * FROM students WHERE roll_no = $1 AND LOWER(name) = LOWER($2)",
      [studentID, name]
    );

    if (studentResult.rows.length === 0) {
      return NextResponse.json(
        { message: "The name and roll number do not match any student record" },
        { status: 409 }
      );
    }

    const studentEmail = studentResult.rows[0].email;
    const correctName = studentResult.rows[0].name; // Store the correctly capitalized name

    // Verify if the provided email matches the student's email (case insensitive)
    if (email.toLowerCase() !== studentEmail.toLowerCase()) {
      return NextResponse.json(
        {
          message: "The provided email does not match with your student record",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsersResult = await connection.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR student_id = $2",
      [email, studentID]
    );

    if (existingUsersResult.rows.length > 0) {
      return NextResponse.json(
        { message: "An account with this email or roll number already exists" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with verification details
    // Use the correctly capitalized name from the database
    const insertResult = await connection.query(
      "INSERT INTO users (email, name, student_id, password, verification_token, token_expiry, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [
        email,
        correctName, // Use the correctly capitalized name from the database
        studentID,
        hashedPassword,
        verificationToken,
        tokenExpiry,
        false,
      ]
    );

    // Send verification email
    const sendMail = await sendVerificationEmail(email, verificationToken);

    if (insertResult.rowCount > 0 && sendMail) {
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
