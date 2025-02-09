import { v4 as uuidv4 } from "uuid";
import { sendQRCodeEmail } from "@/util/email";
import { connection } from "@/util/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function POST(request) {
  const user = await getCurrentUser();
  try {
    const { eventId, eventName } = await request.json();

    const userName = user?.name;
    const email = user?.email;

    // Input validation
    if (!eventId || !userName || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique registration ID and QR code secret
    const registrationId = uuidv4();
    const qrCodeSecret = uuidv4();

    // Generate QR code
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${registrationId}`;

    try {
      const [rows] = await connection.execute(
        "select * from event_registrations where user_id = ? and event_id = ?",
        [user?.id, eventId]
      );

      if (rows.length > 0) {
        return NextResponse.json(
          { message: "You already registered for this event" },
          { status: 200 }
        );
      }
      await connection.execute(
        "INSERT INTO event_registrations (event_id, user_id, user_name, email, qr_code_secret) VALUES (?, ?, ?, ?, ?)",
        [eventId, user?.id, userName, email, registrationId]
      );

      // Send QR code via email
      await sendQRCodeEmail(email, userName, qrCodeDataUrl, eventName);
      // console.log(qrCodeDataUrl);

      return NextResponse.json(
        {
          message:
            "Registration successful! Please check your email for the QR code.",
        },
        { status: 200 }
      );
    } finally {
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "You already registered for this event" },
      { status: 500 }
    );
  }
}
