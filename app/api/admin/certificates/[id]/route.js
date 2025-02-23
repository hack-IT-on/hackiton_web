import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connection.execute("DELETE FROM `event_certificates` WHERE id = ?", [
      id,
    ]);

    return NextResponse.json({
      message: "Event certificate deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();
    const file = formData.get("template_file");
    const name = formData.get("name");
    const event_id = formData.get("event_id");
    const certificate_issue_date = formData.get("certificate_issue_date");

    let template_url = formData.get("template_url"); // Get existing URL if no new file

    // Handle file upload if new file exists
    if (file) {
      const fileType = file.type;
      const fileName = `certificates/${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      // const fileName2 = await uploadFileToS3(buffer, fileName);

      // Upload to S3
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        ContentType: fileType,
        Body: buffer,
        // ACL: "public-read",
      });

      await s3Client.send(putObjectCommand);

      // Generate the new file URL
      template_url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    // Update database
    await connection.execute(
      `UPDATE event_certificates 
       SET name = ?, event_id = ?, certificate_issue_date = ?, template_url = ?
       WHERE id = ?`,
      [name, event_id, certificate_issue_date, template_url, id]
    );

    return NextResponse.json({
      message: "Certificate updated successfully",
      template_url,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
