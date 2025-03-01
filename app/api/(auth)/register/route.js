import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client with improved timeout settings
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    // Add longer timeouts for mobile environments
    connectionTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
  },
});

// Helper function to upload image to S3 with improved error handling
async function uploadImageToS3(imageData, prefix, studentID) {
  try {
    // Check image size before processing
    if (imageData.length > 5000000) {
      // ~5MB
      console.log(
        `Large ${prefix} image detected (${imageData.length} bytes), might need compression`
      );
    }

    // Process base64 image data
    const base64Data = imageData.split(";base64,").pop();
    if (!base64Data) {
      throw new Error("Invalid image format");
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileExt = imageData.includes("image/jpeg")
      ? "jpg"
      : imageData.includes("image/png")
      ? "png"
      : "jpg";
    const fileName = `${prefix}/${studentID}_${uuidv4()}.${fileExt}`;

    // Determine content type
    const contentType = imageData.includes("image/jpeg")
      ? "image/jpeg"
      : imageData.includes("image/png")
      ? "image/png"
      : "image/jpeg";

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    console.log(`Uploading ${prefix} image to S3: ${fileName}`);
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log(`Successfully uploaded ${prefix} image`);

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error(`Error in uploadImageToS3 for ${prefix}:`, error);
    throw new Error(`Failed to upload ${prefix} image: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    // Log device information
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    console.log(
      `Registration request from ${
        isMobile ? "mobile" : "desktop"
      } device: ${userAgent}`
    );

    // Parse request body
    const body = await request.json();
    const {
      name,
      studentID,
      email,
      password,
      cpassword,
      faceImage,
      idCardImage,
    } = body;

    console.log(`Registration attempt for: ${email}, ID: ${studentID}`);

    // Log image sizes if present
    if (faceImage) {
      console.log(`Face image data length: ${faceImage.length} bytes`);
    }
    if (idCardImage) {
      console.log(`ID card image data length: ${idCardImage.length} bytes`);
    }

    // Validate input
    if (!name || !studentID || !email || !password || !cpassword) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "All fields are required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!faceImage || !idCardImage) {
      console.log("Missing image uploads");
      return NextResponse.json(
        { message: "Both face image and ID card image are required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (password !== cpassword) {
      console.log("Password mismatch");
      return NextResponse.json(
        { message: "Password and confirm password do not match" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already exists
    console.log("Checking for existing users");
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ? OR student_id = ?",
      [email, studentID]
    );

    const [existingStudent] = await connection.execute(
      "SELECT * FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );

    if (existingStudent.length === 0) {
      console.log("Student record not found");
      return NextResponse.json(
        { message: "The name and roll number do not match our records" },
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (existingUsers.length > 0) {
      console.log("User already exists");
      return NextResponse.json(
        { message: "An account with this email or roll number already exists" },
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upload images with separate error handling for each
    let faceImageUrl = null;
    let idCardImageUrl = null;

    // Upload face image
    try {
      console.log("Uploading face image");
      faceImageUrl = await uploadImageToS3(faceImage, "faces", studentID);
    } catch (faceUploadError) {
      console.error("Face image upload failed:", faceUploadError);
      return NextResponse.json(
        {
          message:
            "Failed to upload face image. Please try a smaller image or check your connection.",
          error: faceUploadError.message,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upload ID card image
    try {
      console.log("Uploading ID card image");
      idCardImageUrl = await uploadImageToS3(
        idCardImage,
        "id_cards",
        studentID
      );
    } catch (idCardUploadError) {
      console.error("ID card image upload failed:", idCardUploadError);
      return NextResponse.json(
        {
          message:
            "Failed to upload ID card image. Please try a smaller image or check your connection.",
          error: idCardUploadError.message,
        },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate verification token
    console.log("Generating verification token");
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash password
    console.log("Hashing password");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with verification details and both image URLs
    console.log("Inserting new user into database");
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

    if (!insertResult || insertResult.affectedRows !== 1) {
      console.error("Database insertion failed:", insertResult);
      return NextResponse.json(
        { message: "Failed to register user - database error" },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send verification email
    console.log("Sending verification email");
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
      // We could optionally delete the user record if email is critical
    }

    console.log("User registration successful");
    return NextResponse.json(
      {
        message:
          "User registered successfully! Please check your email to verify your account.",
        userId: insertResult.insertId,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        message: "Internal server error during registration",
        error: error.message,
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
