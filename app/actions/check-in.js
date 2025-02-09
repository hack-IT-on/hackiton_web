"use server";

import { decrypt } from "@/util/encryption";
import { connection } from "@/util/db";

export async function checkInAttendee(qrCode) {
  try {
    if (!qrCode) {
      return {
        error: "QR code is required",
      };
    }

    // Decrypt QR code payload
    const decrypted = decrypt(qrCode);
    const { registrationId, eventId, secret } = JSON.parse(decrypted);

    try {
      // Verify registration and check-in status
      const [rows] = await connection.execute(
        "SELECT is_checked_in, qr_code_secret FROM registrations WHERE id = ? AND event_id = ?",
        [registrationId, eventId]
      );

      if (rows.length === 0) {
        return {
          error: "Registration not found",
        };
      }

      const registration = rows[0];

      if (registration.qr_code_secret !== secret) {
        return {
          error: "Invalid QR code",
        };
      }

      if (registration.is_checked_in) {
        return {
          error: "Already checked in",
        };
      }

      // Mark as checked in
      await connection.execute(
        "UPDATE registrations SET is_checked_in = TRUE, check_in_time = NOW() WHERE id = ?",
        [registrationId]
      );

      return {
        success: true,
        message: "Check-in successful",
      };
    } finally {
      // connection.release();
    }
  } catch (error) {
    console.error("Check-in error:", error);
    return {
      error: "Check-in failed",
    };
  }
}
