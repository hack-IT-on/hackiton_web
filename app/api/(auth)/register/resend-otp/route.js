import { NextResponse } from "next/server";
import { connection } from "@/util/db";
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

// Handler for POST requests
export async function POST(request) {
  const { studentID, name } = await request.json();

  try {
    const [existingStudent] = await connection.execute(
      "SELECT mobile_number FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );

    if (!existingStudent || existingStudent.length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    const mobile_number = existingStudent[0].mobile_number;
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Update user as verified
    await connection.execute(
      "UPDATE users SET otp = ? WHERE student_id = ? AND name = ?",
      [otp, studentID, name]
    );

    await sendOTP(`+91${mobile_number}`, otp);

    return NextResponse.json(
      { message: "OTP sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Add handler for other HTTP methods
export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
