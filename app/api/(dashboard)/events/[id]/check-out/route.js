import { connection } from "@/util/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { sendQRCodeEmailOut } from "@/util/email";

function generateHexCode() {
  return uuidv4().replace(/-/g, "").substring(0, 6);
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const { id } = params;
  const eventId = id;

  // const userName = user?.name;
  // const email = user?.email;

  const qrCodeSecret = searchParams.get("qr_code_secret_out");

  if (!qrCodeSecret) {
    return NextResponse.json(
      { error: "QR code secret is required" },
      { status: 400 }
    );
  }

  try {
    // PostgreSQL syntax for JOIN
    const result = await connection.query(
      `SELECT er.is_checked_out, er.qr_code_secret_out, e.title 
       FROM event_registrations er 
       JOIN events e ON er.event_id = e.id 
       WHERE er.qr_code_secret_out = $1 AND er.event_id = $2`,
      [qrCodeSecret, eventId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = result.rows[0];

    if (registration.qr_code_secret_out !== qrCodeSecret) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
    }

    if (registration.is_checked_out) {
      return NextResponse.json(
        { error: "Already checked out" },
        { status: 400 }
      );
    }

    let certificate_id = `BIT_HACKITON_${user.id}${generateHexCode()}`;

    // Mark as checked out - PostgreSQL NOW() function works the same way
    await connection.query(
      `UPDATE event_registrations 
       SET is_checked_out = 1, 
           check_out_time = NOW(), 
           certificate_id = $1 
       WHERE qr_code_secret_out = $2 AND event_id = $3`,
      [certificate_id, qrCodeSecret, eventId]
    );

    return NextResponse.json(
      { message: "Check-out successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Failed to process check-out" },
      { status: 500 }
    );
  }
}
