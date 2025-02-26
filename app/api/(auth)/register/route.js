import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to upload image to S3
async function uploadImageToS3(imageData, prefix, studentID) {
  // Process base64 image data
  const base64Data = imageData.split(";base64,").pop();
  const buffer = Buffer.from(base64Data, "base64");

  // Generate unique filename
  const fileExt = imageData.includes("image/jpeg")
    ? "jpg"
    : imageData.includes("image/png")
    ? "png"
    : "jpg";
  const fileName = `${prefix}/${studentID}_${uuidv4()}.${fileExt}`;

  // Upload to S3
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: imageData.includes("image/jpeg")
      ? "image/jpeg"
      : imageData.includes("image/png")
      ? "image/png"
      : "image/jpeg",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

export async function POST(request) {
  try {
    const {
      name,
      studentID,
      email,
      password,
      cpassword,
      faceImage,
      idCardImage,
    } = await request.json();

    // Validate input
    if (
      !name ||
      !studentID ||
      !email ||
      !password ||
      !cpassword ||
      !faceImage ||
      !idCardImage
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== cpassword) {
      return NextResponse.json(
        { message: "Password and confirm password is not matched!" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ? or student_id = ?",
      [email, studentID]
    );

    const [existingStudent] = await connection.execute(
      "SELECT * FROM students WHERE roll_no = ? AND name = ?",
      [studentID, name]
    );

    if (existingStudent.length == 0) {
      return NextResponse.json(
        { message: `The name and roll number do not match.` },
        { status: 409 }
      );
    }

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email or roll no. already exists" },
        { status: 409 }
      );
    }

    // Upload face image and ID card image to S3
    let faceImageUrl = null;
    let idCardImageUrl = null;

    try {
      // Upload face image
      if (faceImage) {
        faceImageUrl = await uploadImageToS3(faceImage, "faces", studentID);
      }

      // Upload ID card image
      if (idCardImage) {
        idCardImageUrl = await uploadImageToS3(
          idCardImage,
          "id_cards",
          studentID
        );
      }
    } catch (uploadError) {
      console.error("Error uploading images to S3:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload images. Please try again." },
        { status: 500 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with verification details and both image URLs
    const insertQuery = await connection.execute(
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

    // Send verification email
    const sendMail = await sendVerificationEmail(email, verificationToken);

    if (insertQuery && sendMail) {
      return NextResponse.json(
        { message: "User registered successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to register user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
