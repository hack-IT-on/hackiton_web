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

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM event_registrations WHERE certificate_id = ?",
        [certificateId]
      );

      if (rows.length === 0) {
        return Response.json(
          { error: "Certificate not found" },
          { status: 404 }
        );
      } else {
        var [event] = await connection.execute(
          "SELECT * FROM `event_certificates` WHERE event_id = ?",
          [rows[0].event_id]
        );
      }

      return Response.json({ registration: rows[0], event: event[0] });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.error("Certificate verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
