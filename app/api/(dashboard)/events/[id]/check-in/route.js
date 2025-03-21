import { connection } from "@/util/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { sendQRCodeEmailOut } from "@/util/email";

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const { id } = await params;
  const eventId = id;

  const userName = user?.name;
  const email = user?.email;

  const qrCodeSecret = searchParams.get("qr_code_secret");

  if (!qrCodeSecret) {
    return NextResponse.json(
      { error: "QR code secret is required" },
      { status: 400 }
    );
  }

  try {
    // Get registration information
    const result = await connection.query(
      "SELECT er.is_checked_in, er.qr_code_secret, er.email, er.user_name, e.title FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.qr_code_secret = $1 AND er.event_id = $2",
      [qrCodeSecret, eventId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = result.rows[0];

    if (registration.qr_code_secret !== qrCodeSecret) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    if (registration.is_checked_in) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    // const qr_check_out = uuidv4();

    // // Generate QR code
    // const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qr_check_out}`;

    const qr_check_out = uuidv4()
      .replace(/-/g, "")
      .substring(0, 16)
      .toUpperCase();

    // Add a prefix to make the code more identifiable and structured
    const qrCodeContent = `EVENT-${eventId}-${qr_check_out}`;

    // Generate QR code with error correction level 'H' (high) for better scanning reliability
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      qrCodeContent
    )}&ecc=H`;

    // Mark as checked in
    await connection.query(
      "UPDATE event_registrations SET is_checked_in = TRUE, check_in_time = NOW(), qr_code_secret_out = $1 WHERE qr_code_secret = $2 AND event_id = $3",
      [qrCodeContent, qrCodeSecret, eventId]
    );

    await sendQRCodeEmailOut(
      registration.email,
      registration.user_name,
      qrCodeDataUrl,
      registration.title
    );

    return NextResponse.json(
      { message: "Check-in successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}
