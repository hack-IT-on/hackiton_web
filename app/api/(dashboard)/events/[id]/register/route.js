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

    // Generate unique registration ID with a more scanner-friendly format
    // Using a shorter alphanumeric string that's easier to scan
    const registrationId = uuidv4()
      .replace(/-/g, "")
      .substring(0, 16)
      .toUpperCase();

    // Add a prefix to make the code more identifiable and structured
    const qrCodeContent = `EVENT-${eventId}-${registrationId}`;

    // Generate QR code with error correction level 'H' (high) for better scanning reliability
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      qrCodeContent
    )}&ecc=H`;

    try {
      const result = await connection.query(
        "SELECT * FROM event_registrations WHERE user_id = $1 AND event_id = $2",
        [user?.id, eventId]
      );

      if (result.rows.length > 0) {
        return NextResponse.json(
          { message: "You already registered for this event" },
          { status: 200 }
        );
      }

      await connection.query(
        "INSERT INTO event_registrations (event_id, user_id, user_name, email, qr_code_secret) VALUES ($1, $2, $3, $4, $5)",
        [eventId, user?.id, userName, email, qrCodeContent]
      );

      // Send QR code via email
      await sendQRCodeEmail(email, userName, qrCodeDataUrl, eventName);

      return NextResponse.json(
        {
          message:
            "Registration successful! Please check your email for the QR code.",
        },
        { status: 200 }
      );
    } finally {
      // No connection release needed if using a pool
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
