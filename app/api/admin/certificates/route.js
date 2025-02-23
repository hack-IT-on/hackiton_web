import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    const [certificates] = await connection.execute(
      `
        SELECT * FROM event_certificates 
        ORDER BY id DESC
      `
    );

    const totalCount = await connection.execute(
      "SELECT COUNT(*) as count FROM event_certificates"
    );

    return NextResponse.json({
      certificates,
      total: totalCount[0].count,
      page,
      totalPages: Math.ceil(totalCount[0].count / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("template_file");
    const name = formData.get("name");
    const event_id = formData.get("event_id");
    const certificate_issue_date = formData.get("certificate_issue_date");

    let template_url = null;

    // Handle file upload if file exists
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

      // Generate the file URL
      template_url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    // Save to database
    const result = await connection.execute(
      `
        INSERT INTO event_certificates (name, event_id, certificate_issue_date, template_url)
        VALUES (?, ?, ?, ?)
      `,
      [name, event_id, certificate_issue_date, template_url]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        template_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
