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

export async function POST(request) {
  const { studentID, name } = await request.json();

  try {
    const [existingStudent] = await connection.execute(
      "SELECT mobile_number FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );
    const mobile_number = existingStudent[0].mobile_number;
    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log(mobile_number);
    sendOTP(`+91${mobile_number}`, otp);

    // Update user as verified
    await connection.execute(
      "UPDATE users SET otp = ? WHERE student_id = ? and name = ?",
      [otp, studentID, name]
    );

    return NextResponse.json(
      { message: "OTP resent successfully." },
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
