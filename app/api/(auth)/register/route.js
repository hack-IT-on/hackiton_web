import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client with mobile-friendly settings
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Much more conservative timeouts for mobile
  requestTimeout: 120000, // 2 minutes
  connectTimeout: 60000, // 1 minute
});

// Improved image upload function with chunked processing
async function uploadImageToS3(imageData, prefix, studentID) {
  try {
    console.log(`Starting ${prefix} image upload process`);

    // Check if the image data is valid
    if (!imageData || typeof imageData !== "string") {
      throw new Error(`Invalid ${prefix} image data received`);
    }

    // Handle different possible image formats from mobile
    let base64Data;
    let contentType;

    if (imageData.includes(";base64,")) {
      // Extract content type and base64 data
      const parts = imageData.split(";base64,");
      contentType = parts[0].replace("data:", "");
      base64Data = parts[1];
    } else {
      // If format is unexpected, try to handle it as generic base64
      console.log(
        `${prefix} image doesn't match expected format, attempting direct processing`
      );
      base64Data = imageData;
      contentType = "image/jpeg"; // Default assumption
    }

    // Validate extracted base64 data
    if (!base64Data) {
      throw new Error(`Could not extract base64 data from ${prefix} image`);
    }

    console.log(`${prefix} image content type: ${contentType}`);
    console.log(`${prefix} image data length: ${base64Data.length} characters`);

    // Determine file extension from content type
    let fileExt;
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      fileExt = "jpg";
    } else if (contentType.includes("png")) {
      fileExt = "png";
    } else if (contentType.includes("webp")) {
      fileExt = "webp";
    } else {
      fileExt = "jpg"; // Default to jpg
    }

    // Create safe, unique filename
    const safeStudentID = studentID.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${prefix}/${safeStudentID}_${uuidv4().substring(
      0,
      8
    )}.${fileExt}`;

    // Convert base64 to buffer in chunks to avoid memory issues
    let buffer;
    try {
      // For extremely large images, we might need chunking
      // but for most cases, this direct conversion works well
      buffer = Buffer.from(base64Data, "base64");
      console.log(`${prefix} image buffer size: ${buffer.length} bytes`);
    } catch (bufferError) {
      console.error(`Error creating buffer for ${prefix} image:`, bufferError);
      throw new Error(
        `Memory error processing ${prefix} image: ${bufferError.message}`
      );
    }

    // Set up S3 parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      // Add caching settings appropriate for user images
      CacheControl: "max-age=31536000",
    };

    console.log(`Uploading ${prefix} image to S3 as ${fileName}`);

    // Upload with explicit error handling
    try {
      const command = new PutObjectCommand(params);
      const uploadResult = await s3Client.send(command);
      console.log(`${prefix} image upload successful:`, uploadResult);
    } catch (s3Error) {
      console.error(`S3 upload error for ${prefix} image:`, s3Error);
      throw new Error(`Failed to upload to S3: ${s3Error.message}`);
    }

    // Return the full URL
    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log(`${prefix} image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`${prefix} image upload failed:`, error);
    throw new Error(`${prefix} image upload failed: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    // Enhanced device detection
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const isMobile =
      /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const deviceType = isMobile ? "mobile" : "desktop";
    const url = request.url || "Unknown URL";

    console.log(`[${deviceType}] Registration attempt from ${userAgent}`);
    console.log(`[${deviceType}] Request URL: ${url}`);

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(
        `[${deviceType}] Failed to parse request body:`,
        parseError
      );
      return NextResponse.json(
        { message: "Invalid request format" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      name,
      studentID,
      email,
      password,
      cpassword,
      faceImage,
      idCardImage,
    } = body;

    console.log(`[${deviceType}] Registration for: ${email}, ID: ${studentID}`);

    // Check required fields
    if (!name || !studentID || !email || !password || !cpassword) {
      return NextResponse.json(
        { message: "Missing required information" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for images
    if (!faceImage) {
      return NextResponse.json(
        { message: "Face image is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!idCardImage) {
      return NextResponse.json(
        { message: "ID card image is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log image data types and sizes
    console.log(`[${deviceType}] Face image type: ${typeof faceImage}`);
    console.log(`[${deviceType}] ID image type: ${typeof idCardImage}`);

    if (typeof faceImage === "string") {
      console.log(
        `[${deviceType}] Face image length: ${faceImage.length} chars`
      );
    }

    if (typeof idCardImage === "string") {
      console.log(
        `[${deviceType}] ID image length: ${idCardImage.length} chars`
      );
    }

    // Password validation
    if (password !== cpassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check existing users
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ? OR student_id = ?",
      [email, studentID]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Account already exists with this email or ID" },
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify student record
    const [existingStudent] = await connection.execute(
      "SELECT * FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );

    if (existingStudent.length === 0) {
      return NextResponse.json(
        { message: "Name and roll number do not match our records" },
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Upload face image - with mobile-specific timeout and retry
    let faceImageUrl = null;
    let uploadAttempts = 0;
    const maxAttempts = 2;

    while (!faceImageUrl && uploadAttempts < maxAttempts) {
      uploadAttempts++;
      try {
        console.log(
          `[${deviceType}] Face image upload attempt ${uploadAttempts}`
        );
        faceImageUrl = await uploadImageToS3(faceImage, "faces", studentID);
      } catch (error) {
        console.error(
          `[${deviceType}] Face image upload attempt ${uploadAttempts} failed:`,
          error
        );

        if (uploadAttempts >= maxAttempts) {
          return NextResponse.json(
            {
              message: "Failed to upload face image after multiple attempts",
              error: error.message,
            },
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        // Brief pause before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Upload ID card image - with mobile-specific timeout and retry
    let idCardImageUrl = null;
    uploadAttempts = 0;

    while (!idCardImageUrl && uploadAttempts < maxAttempts) {
      uploadAttempts++;
      try {
        console.log(
          `[${deviceType}] ID card image upload attempt ${uploadAttempts}`
        );
        idCardImageUrl = await uploadImageToS3(
          idCardImage,
          "id_cards",
          studentID
        );
      } catch (error) {
        console.error(
          `[${deviceType}] ID card image upload attempt ${uploadAttempts} failed:`,
          error
        );

        if (uploadAttempts >= maxAttempts) {
          return NextResponse.json(
            {
              message: "Failed to upload ID card image after multiple attempts",
              error: error.message,
            },
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        // Brief pause before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Now that images are uploaded, complete registration
    console.log(`[${deviceType}] Both images uploaded successfully`);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user record
    try {
      const [insertResult] = await connection.execute(
        "INSERT INTO users (email, name, student_id, password, verification_token, token_expiry, is_verified, face_image_url, id_card_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          name,
          studentID,
          hashedPassword,
          verificationToken,
          tokenExpiry,
          false,
          faceImageUrl,
          idCardImageUrl,
        ]
      );

      console.log(`[${deviceType}] User inserted into database:`, insertResult);

      // Send verification email
      try {
        await sendVerificationEmail(email, verificationToken);
        console.log(`[${deviceType}] Verification email sent to ${email}`);
      } catch (emailError) {
        console.error(
          `[${deviceType}] Failed to send verification email:`,
          emailError
        );
        // Continue with registration even if email fails
      }

      return NextResponse.json(
        {
          message:
            "Registration successful! Please check your email to verify your account.",
          success: true,
        },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      console.error(`[${deviceType}] Database insertion error:`, dbError);
      return NextResponse.json(
        { message: "Failed to complete registration", error: dbError.message },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration process failed", error: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
