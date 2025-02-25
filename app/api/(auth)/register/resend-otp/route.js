import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { Twilio } from "twilio";

async function sendOTP(number, otp) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials are missing");
    }

    const client = new Twilio(accountSid, authToken);

    if (!process.env.TWILIO_MOBILE_NUMBER) {
      throw new Error("Twilio sender phone number is missing");
    }

    const message = await client.messages.create({
      body: `Your Hack-IT-On One-Time Password is: ${otp}`,
      from: process.env.TWILIO_MOBILE_NUMBER,
      to: number,
    });

    console.log("SMS sent successfully:", message.sid);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    throw error; // Rethrow to handle in the main function
  }
}

// Handler for POST requests
export async function POST(request) {
  console.log("POST request received");

  try {
    // Check if request body is valid
    const body = await request.json();
    console.log("Request body parsed:", JSON.stringify(body));

    const { studentID, name } = body;

    if (!studentID || !name) {
      return NextResponse.json(
        { message: "Missing required fields: studentID and name" },
        { status: 400 }
      );
    }

    console.log("Checking database for student:", studentID, name);

    // Check database connection
    if (!connection) {
      console.error("Database connection not established");
      return NextResponse.json(
        { message: "Database connection error" },
        { status: 500 }
      );
    }

    // Query for student
    try {
      const [existingStudent] = await connection.execute(
        "SELECT mobile_number FROM students WHERE roll_no = ? AND name = ?",
        [studentID, name]
      );

      console.log("Database query result:", JSON.stringify(existingStudent));

      if (!existingStudent || existingStudent.length === 0) {
        return NextResponse.json(
          { message: "Student not found" },
          { status: 404 }
        );
      }

      const mobile_number = existingStudent[0].mobile_number;
      if (!mobile_number) {
        return NextResponse.json(
          { message: "Student has no associated mobile number" },
          { status: 400 }
        );
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      console.log("Generated OTP:", otp, "for mobile:", mobile_number);

      // Update user with OTP
      console.log("Updating users table with OTP");
      await connection.execute(
        "UPDATE users SET otp = ? WHERE student_id = ? AND name = ?",
        [otp, studentID, name]
      );
      console.log("OTP updated in database");

      // Send OTP via SMS
      console.log("Sending OTP via SMS");
      await sendOTP(`+91${mobile_number}`, otp);
      console.log("OTP sent successfully");

      return NextResponse.json(
        { message: "OTP sent successfully." },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.json(
        {
          message: "Database operation failed",
          error: dbError.message,
          stack: dbError.stack,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
        stack: error.stack,
      },
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
