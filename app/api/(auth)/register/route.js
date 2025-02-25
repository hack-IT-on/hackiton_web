import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";
import { Twilio } from "twilio";

async function sendOTP(number, otp) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = new Twilio(accountSid, authToken);

  const message = await client.messages.create({
    body: `Your Hack-IT-On One-Time Password is: ${otp}`,
    from: process.env.TWILIO_MOBILE_NUMBER,
    to: number,
  });

  console.log(message.body);
}

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

    //send otp
    const mobile_number = existingStudent[0].mobile_number;
    const otp = Math.floor(100000 + Math.random() * 900000);
    sendOTP(`+91${mobile_number}`, otp);

    // Insert new user with verification details
    const insertQuery = await connection.execute(
      "INSERT INTO users (email, name, leetcode_username, password, verification_token, token_expiry, is_verified, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        name,
        studentID,
        hashedPassword,
        verificationToken,
        tokenExpiry,
        false,
        otp,
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
