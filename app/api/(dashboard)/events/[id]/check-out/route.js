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

  const userName = user.name;
  const email = user.email;
  // return NextResponse.json(eventId);
  const qrCodeSecret = searchParams.get("qr_code_secret_out");
  // console.log(qrCodeSecret);

  if (!qrCodeSecret) {
    return NextResponse.json(
      { error: "QR code secret is required" },
      { status: 400 }
    );
  }

  try {
    // Start a transaction to ensure data consistency

    const [rows] = await connection.execute(
      "SELECT er.is_checked_out, er.qr_code_secret_out, e.title FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.qr_code_secret_out = ? AND er.event_id = ?",
      [qrCodeSecret, eventId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = rows[0];

    if (registration.qr_code_secret_out !== qrCodeSecret) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    if (registration.is_checked_out) {
      return NextResponse.json(
        { error: "Already checked out" },
        { status: 400 }
      );
    }

    // Mark as checked in
    await connection.execute(
      "UPDATE event_registrations SET is_checked_out = TRUE, check_out_time = NOW() WHERE qr_code_secret_out = ? AND event_id = ?",
      [qrCodeSecret, eventId]
    );

    return NextResponse.json(
      { message: "Check-out successful" },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction on error

    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Failed to process check-out" },
      { status: 500 }
    );
  }
}
