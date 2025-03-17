import { connection } from "@/util/db";

export async function POST(request) {
  try {
    const { certificateId } = await request.json();

    if (!certificateId) {
      return Response.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // First get the registration information
    const registrations = await connection.query(
      "SELECT * FROM event_registrations WHERE certificate_id = $1",
      [certificateId]
    );

    if (registrations.rowCount === 0) {
      return Response.json({ error: "Certificate not found" }, { status: 404 });
    }

    const registration = registrations.rows[0];

    // Then fetch the certificate information using the event_id
    const certificates = await connection.query(
      "SELECT * FROM event_certificates WHERE event_id = $1",
      [registration.event_id]
    );

    // Check if certificate exists
    if (certificates.rowCount === 0) {
      return Response.json(
        { error: "Certificate template not found" },
        { status: 404 }
      );
    }

    return Response.json({
      registration: registration,
      event: certificates.rows[0],
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
