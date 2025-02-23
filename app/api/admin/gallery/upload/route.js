import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { connection } from "@/util/db";

// Initialize S3 client with error handling
let s3Client;
try {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} catch (error) {
  console.error("S3 Client initialization error:", {
    error: error.message,
    stack: error.stack,
    region: process.env.AWS_REGION ? "Set" : "Not Set",
    accessKey: process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not Set",
    secretKey: process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not Set",
  });
}

export async function POST(request) {
  try {
    // Log request details
    console.log("Starting upload process");
    console.log("Environment check:", {
      region: process.env.AWS_REGION ? "Set" : "Not Set",
      bucketName: process.env.AWS_S3_BUCKET_NAME ? "Set" : "Not Set",
      accessKey: process.env.AWS_ACCESS_KEY_ID ? "Set" : "Not Set",
      secretKey: process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Not Set",
    });

    // Validate environment variables
    const requiredEnvVars = [
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_S3_BUCKET_NAME",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing environment variable: ${envVar}`);
        return NextResponse.json(
          { error: `Server configuration error: Missing ${envVar}` },
          { status: 500 }
        );
      }
    }

    // Check S3 client initialization
    if (!s3Client) {
      console.error("S3 client not initialized");
      return NextResponse.json(
        { error: "S3 client initialization failed" },
        { status: 500 }
      );
    }

    // Check database connection
    if (!connection) {
      console.error("Database connection not available");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
      console.log("Form data parsed successfully");
    } catch (formError) {
      console.error("Form data parsing error:", formError);
      return NextResponse.json(
        { error: "Failed to parse form data" },
        { status: 400 }
      );
    }

    const title = formData.get("title");
    const tags = formData.get("tags");
    const file = formData.get("file");

    // Log received data
    console.log("Received data:", {
      hasTitle: !!title,
      hasTags: !!tags,
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
    });

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and GIF are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `gallery/${timestamp}-${sanitizedFileName}`;

    // Convert file to buffer with error handling
    let buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
      console.log("File converted to buffer successfully");
    } catch (bufferError) {
      console.error("Buffer conversion error:", bufferError);
      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 500 }
      );
    }

    // Upload to S3
    try {
      console.log("Attempting S3 upload...");
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      });

      await s3Client.send(uploadCommand);
      console.log("S3 upload successful");
    } catch (s3Error) {
      console.error("S3 upload error:", {
        error: s3Error.message,
        stack: s3Error.stack,
        code: s3Error.code,
        requestId: s3Error.$metadata?.requestId,
      });
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${s3Error.message}` },
        { status: 500 }
      );
    }

    // Generate S3 URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    // Save to database
    try {
      console.log("Attempting database insert...");
      const [result] = await connection.execute(
        "INSERT INTO gallery (title, tags, url) VALUES (?, ?, ?)",
        [title, tags || null, imageUrl]
      );
      console.log("Database insert successful");
    } catch (dbError) {
      console.error("Database error:", {
        error: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        sqlMessage: dbError.sqlMessage,
      });
      return NextResponse.json(
        { error: `Failed to save to database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Upload error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      cause: error.cause,
    });
    return NextResponse.json(
      { error: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
