"use server";

import { v4 as uuidv4 } from "uuid";
import { encrypt } from "@/util/encryption";
import { sendQRCodeEmail } from "@/util/email";
import { generateQRCode } from "@/util/qrcode";
import { connection } from "@/util/db";

export async function registerForEvent(formData) {
  try {
    const eventId = formData.get("eventId");
    const userName = formData.get("userName");
    const email = formData.get("email");

    // Input validation
    if (!eventId || !userName || !email) {
      return {
        error: "Missing required fields",
      };
    }

    // Generate unique registration ID and QR code secret
    const registrationId = uuidv4();
    const qrCodeSecret = uuidv4();

    // Create encrypted payload for QR code
    const qrPayload = encrypt(
      JSON.stringify({
        registrationId,
        eventId,
        secret: qrCodeSecret,
      })
    );

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(qrPayload);

    try {
      await connection.execute(
        "INSERT INTO event_registrations (id, event_id, user_name, email, qr_code_secret) VALUES (?, ?, ?, ?, ?)",
        [registrationId, eventId, userName, email, qrCodeSecret]
      );

      // Send QR code via email
      await sendQRCodeEmail(email, userName, qrCodeDataUrl);

      return {
        success: true,
        message: "Registration successful",
      };
    } finally {
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "Registration failed",
    };
  }
}
