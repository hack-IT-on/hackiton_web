import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { generatePDF } from "@/util/certificates";
import { getCurrentUser } from "@/lib/getCurrentUser";
// import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  const user = await getCurrentUser();
  try {
    const { certificateId } = await request.json();

    const userName = user.name;

    // Get certificate template
    const [templates] = await connection.execute(
      "SELECT * FROM event_certificates WHERE id = ?",
      [certificateId]
    );
    const template = templates[0];

    if (!template) {
      return NextResponse.json(
        { error: "Certificate template not found" },
        { status: 404 }
      );
    }

    // console.log(template);

    // Generate PDF
    // const issueDate = new Date();
    const pdfBuffer = await generatePDF(
      template.template_url,
      userName,
      template.certificate_issue_date,
      template.name
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
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
