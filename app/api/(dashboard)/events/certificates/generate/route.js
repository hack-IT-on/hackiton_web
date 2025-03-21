import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { generatePDF } from "@/util/certificates";
import { getCurrentUser } from "@/lib/getCurrentUser";
// import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  const user = await getCurrentUser();
  try {
    const { certificateId } = await request.json();

    const userName = user?.name;

    // Get certificate template
    const templateResult = await connection.query(
      "SELECT * FROM event_certificates WHERE id = $1",
      [certificateId]
    );
    const template = templateResult.rows[0];

    if (!template) {
      return NextResponse.json(
        { error: "Certificate template not found" },
        { status: 404 }
      );
    }

    const certificateRegResult = await connection.query(
      "SELECT certificate_id FROM event_registrations WHERE event_id = $1 AND user_id = $2",
      [template.event_id, user?.id]
    );

    const certificate_reg = certificateRegResult.rows[0];

    // Generate PDF
    // const issueDate = new Date();
    const pdfBuffer = await generatePDF(
      template.template_url,
      userName,
      template.certificate_issue_date,
      template.name,
      certificate_reg.certificate_id
    );

    console.log("ok");

    // const filename = `certificate-${uuidv4()}.pdf`;
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${userName}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

    // return NextResponse.json({ id, pdfUrl });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
