import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    // Get the file from form data
    const file = formData.get("file");
    let template_url = "";

    // Handle file upload if file exists
    if (file && file instanceof Blob) {
      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `events/${Date.now()}-${file.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`;

        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: fileBuffer,
          ContentType: file.type,
        });

        await s3Client.send(putObjectCommand);

        // Construct the S3 URL
        template_url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        console.log("File uploaded successfully:", template_url);
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw new Error("Failed to upload file to S3");
      }
    }

    // Rest of your code for database insertion remains the same
    const result = await connection.execute(
      `INSERT INTO events (
        title, description, long_description, image_url, 
        date, location, interest, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title,
        body.description,
        body.long_description || "",
        template_url, // Use the S3 URL here
        body.date,
        body.location,
        body.interest || null,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      result: result[0],
      imageUrl: template_url,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
