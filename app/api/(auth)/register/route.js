import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, generateVerificationToken } from "@/util/email";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Structured logging helper
function log(device, level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    device,
    level,
    message,
    ...data,
  };

  console.log(JSON.stringify(logEntry));

  // For critical errors, you might want to log to a separate service
  if (level === "ERROR" || level === "CRITICAL") {
    // TODO: Potentially add external error logging service integration here
  }
}

// Initialize S3 client with more mobile-friendly settings
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Even more generous timeouts for mobile
  requestTimeout: 180000, // 3 minutes
  connectTimeout: 90000, // 1.5 minutes
  // Add retry configuration
  maxAttempts: 3,
});

// Image processor with better error handling and diagnostics
async function processAndResizeImage(imageData, deviceType) {
  // Debug: Log image data characteristics
  const imageLength =
    typeof imageData === "string" ? imageData.length : "not a string";
  log(deviceType, "DEBUG", "Processing image", {
    imageLength,
    imageType: typeof imageData,
    imageStartsWith:
      typeof imageData === "string"
        ? imageData.substring(0, 50) + "..."
        : "N/A",
  });

  // Simple validation
  if (!imageData || typeof imageData !== "string") {
    throw new Error(`Invalid image data received (${typeof imageData})`);
  }

  // Determine image format
  let contentType = "image/jpeg"; // Default
  let base64Data = imageData;

  if (imageData.includes(";base64,")) {
    const parts = imageData.split(";base64,");
    contentType = parts[0].replace("data:", "");
    base64Data = parts[1];
    log(deviceType, "DEBUG", "Image format detected", { contentType });
  } else {
    // If no content type detected, try to determine from first bytes
    log(deviceType, "DEBUG", "No standard format detected, analyzing raw data");

    // Check for common image headers in base64
    if (imageData.startsWith("/9j/")) {
      contentType = "image/jpeg";
      log(deviceType, "DEBUG", "Detected JPEG from header signature");
    } else if (imageData.startsWith("iVBORw0KGg")) {
      contentType = "image/png";
      log(deviceType, "DEBUG", "Detected PNG from header signature");
    } else if (imageData.startsWith("UklGR")) {
      contentType = "image/webp";
      log(deviceType, "DEBUG", "Detected WebP from header signature");
    } else {
      log(deviceType, "WARN", "Unknown image format, defaulting to JPEG");
    }
  }

  return { base64Data, contentType };
}

// Improved image upload with better diagnostics
async function uploadImageToS3(imageData, prefix, studentID, deviceType) {
  const logPrefix = `[${prefix}]`;

  try {
    log(deviceType, "INFO", `${logPrefix} Starting image upload process`);

    // Process image data with better error handling
    let { base64Data, contentType } = await processAndResizeImage(
      imageData,
      deviceType
    );

    // Get file extension
    let fileExt = "jpg";
    if (contentType.includes("png")) fileExt = "png";
    else if (contentType.includes("webp")) fileExt = "webp";

    // Create filename
    const safeStudentID = studentID.replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `${prefix}/${safeStudentID}_${uniqueId}_${deviceType}.${fileExt}`;

    log(deviceType, "INFO", `${logPrefix} Creating buffer`, {
      base64Length: base64Data.length,
      contentType,
      fileName,
    });

    // Create buffer with error handling
    let buffer;
    try {
      buffer = Buffer.from(base64Data, "base64");

      // Debug buffer size
      const bufferSizeKB = Math.round(buffer.length / 1024);
      log(deviceType, "DEBUG", `${logPrefix} Buffer created`, {
        sizeKB: bufferSizeKB,
        fileName,
      });

      // If buffer is unreasonably large, warn
      if (bufferSizeKB > 5000) {
        log(deviceType, "WARN", `${logPrefix} Very large image detected`, {
          sizeKB: bufferSizeKB,
        });
      }
    } catch (bufferError) {
      log(deviceType, "ERROR", `${logPrefix} Buffer creation failed`, {
        error: bufferError.message,
        stack: bufferError.stack,
      });
      throw new Error(`Memory error processing image: ${bufferError.message}`);
    }

    // Set up S3 parameters with additional debugging
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Validate AWS settings
    if (!bucketName) {
      log(
        deviceType,
        "ERROR",
        `${logPrefix} Missing AWS bucket name in environment`,
        {
          availableEnvVars: Object.keys(process.env)
            .filter((key) => key.startsWith("AWS"))
            .map((key) => `${key}: ${process.env[key] ? "set" : "not set"}`),
        }
      );
      throw new Error("AWS bucket configuration missing");
    }

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000",
    };

    log(deviceType, "INFO", `${logPrefix} Uploading to S3`, {
      bucket: bucketName,
      fileName,
      region: process.env.AWS_REGION,
      contentType,
    });

    // Start timing the upload
    const uploadStartTime = Date.now();

    // Upload with enhanced error handling
    try {
      const command = new PutObjectCommand(params);
      const uploadResult = await s3Client.send(command);

      const uploadDuration = Date.now() - uploadStartTime;
      const uploadSpeedKBps = Math.round(
        buffer.length / 1024 / (uploadDuration / 1000)
      );

      log(deviceType, "INFO", `${logPrefix} Upload successful`, {
        fileName,
        durationMs: uploadDuration,
        speedKBps: uploadSpeedKBps,
        uploadId: uploadResult.ETag,
      });
    } catch (s3Error) {
      log(deviceType, "ERROR", `${logPrefix} S3 upload failed`, {
        error: s3Error.message,
        code: s3Error.code,
        fileName,
        durationMs: Date.now() - uploadStartTime,
        stack: s3Error.stack,
      });

      // Provide more specific error messages based on AWS error codes
      if (s3Error.code === "NetworkingError") {
        throw new Error(
          `Network issue during upload. Mobile connection may be unstable.`
        );
      } else if (s3Error.code === "AccessDenied") {
        throw new Error(`AWS credentials issue. Please contact support.`);
      } else {
        throw new Error(`S3 upload failed: ${s3Error.message}`);
      }
    }

    // Return the full URL
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    log(deviceType, "INFO", `${logPrefix} Generated image URL`, { imageUrl });
    return imageUrl;
  } catch (error) {
    log(deviceType, "ERROR", `${logPrefix} Upload process failed`, {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Let the caller handle it
  }
}

// Improved exponential backoff retry mechanism
async function retryOperation(
  operation,
  maxAttempts,
  initialDelay,
  deviceType,
  operationName
) {
  let attempt = 1;
  let delay = initialDelay;

  while (attempt <= maxAttempts) {
    try {
      log(
        deviceType,
        "INFO",
        `${operationName} attempt ${attempt}/${maxAttempts}`
      );
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        log(
          deviceType,
          "ERROR",
          `${operationName} failed after ${maxAttempts} attempts`,
          {
            finalError: error.message,
          }
        );
        throw error;
      }

      log(
        deviceType,
        "WARN",
        `${operationName} attempt ${attempt} failed, retrying`,
        {
          error: error.message,
          nextAttemptIn: `${delay}ms`,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff with jitter
      delay = Math.min(delay * 2, 10000) * (0.8 + Math.random() * 0.4);
      attempt++;
    }
  }
}

export async function POST(request) {
  // Track overall processing time
  const startTime = Date.now();

  // Enhanced device detection
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const isMobile =
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const deviceType = isMobile ? "mobile" : "desktop";

  // Get more specific device info for debugging
  const deviceInfo = {
    userAgent,
    isMobile,
    deviceType,
    ip: request.headers.get("x-forwarded-for") || "Unknown",
    url: request.url || "Unknown URL",
  };

  log(deviceType, "INFO", `Registration attempt started`, deviceInfo);

  try {
    // Parse request body with detailed error handling
    let body;
    try {
      body = await request.json();
      log(deviceType, "DEBUG", "Request body parsed", {
        hasEmail: !!body.email,
        hasName: !!body.name,
        hasStudentID: !!body.studentID,
        hasFaceImage: !!body.faceImage,
        hasIdCardImage: !!body.idCardImage,
        imageDataSizes: {
          faceImageChars: body.faceImage ? body.faceImage.length : 0,
          idCardImageChars: body.idCardImage ? body.idCardImage.length : 0,
        },
      });
    } catch (parseError) {
      log(deviceType, "ERROR", "Failed to parse request body", {
        error: parseError.message,
        contentType: request.headers.get("content-type"),
      });
      return NextResponse.json(
        {
          message:
            "Invalid request format. Please check your data format and try again.",
        },
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

    log(deviceType, "INFO", `Processing registration`, {
      email,
      studentID,
      name: name ? `${name.substring(0, 1)}...` : undefined, // Only log first initial for privacy
    });

    // Validate required fields with specific responses
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!studentID) missingFields.push("student ID");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!cpassword) missingFields.push("password confirmation");

    if (missingFields.length > 0) {
      const message = `Missing required information: ${missingFields.join(
        ", "
      )}`;
      log(deviceType, "WARN", message);
      return NextResponse.json(
        { message, missingFields },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log(deviceType, "WARN", "Invalid email format", { email });
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for images with more detail
    if (!faceImage) {
      log(deviceType, "WARN", "Face image missing");
      return NextResponse.json(
        { message: "Face image is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!idCardImage) {
      log(deviceType, "WARN", "ID card image missing");
      return NextResponse.json(
        { message: "ID card image is required" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log image data information for debugging
    log(deviceType, "DEBUG", "Image data received", {
      faceImageType: typeof faceImage,
      idCardImageType: typeof idCardImage,
      faceImageLength:
        typeof faceImage === "string" ? faceImage.length : "not a string",
      idCardImageLength:
        typeof idCardImage === "string" ? idCardImage.length : "not a string",
    });

    // Password validation
    if (password !== cpassword) {
      log(deviceType, "WARN", "Password mismatch");
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      log(deviceType, "WARN", "Password too short");
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check existing users with more informative response
    try {
      log(deviceType, "INFO", "Checking for existing user", {
        email,
        studentID,
      });
      const [existingUsers] = await connection.execute(
        "SELECT email, student_id FROM users WHERE email = ? OR student_id = ?",
        [email, studentID]
      );

      if (existingUsers.length > 0) {
        const existingEmail = existingUsers.some(
          (user) => user.email === email
        );
        const existingID = existingUsers.some(
          (user) => user.student_id === studentID
        );

        let message = "Account already exists";
        if (existingEmail && existingID) {
          message = "Account already exists with this email and student ID";
        } else if (existingEmail) {
          message = "Account already exists with this email";
        } else if (existingID) {
          message = "Account already exists with this student ID";
        }

        log(deviceType, "WARN", message, {
          existingEmail,
          existingID,
        });

        return NextResponse.json(
          { message },
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (dbError) {
      log(deviceType, "ERROR", "Database error checking existing users", {
        error: dbError.message,
        stack: dbError.stack,
      });
      return NextResponse.json(
        {
          message: "Database error, please try again later",
          error: dbError.message,
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify student record
    try {
      log(deviceType, "INFO", "Verifying student records", { studentID, name });
      const [existingStudent] = await connection.execute(
        "SELECT * FROM students WHERE roll_no = ? AND name = ?",
        [studentID, name]
      );

      if (existingStudent.length === 0) {
        log(deviceType, "WARN", "Student record not found or name mismatch", {
          studentID,
          providedName: name,
        });
        return NextResponse.json(
          {
            message:
              "Name and roll number do not match our records. Please check your information and try again.",
          },
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (dbError) {
      log(deviceType, "ERROR", "Database error verifying student record", {
        error: dbError.message,
        stack: dbError.stack,
      });
      return NextResponse.json(
        {
          message: "Database error, please try again later",
          error: dbError.message,
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Upload face image with better retry policy
    let faceImageUrl = null;
    try {
      log(deviceType, "INFO", "Starting face image upload");
      faceImageUrl = await retryOperation(
        () => uploadImageToS3(faceImage, "faces", studentID, deviceType),
        3, // max attempts
        1000, // initial delay in ms
        deviceType,
        "Face image upload"
      );
    } catch (error) {
      log(deviceType, "ERROR", "Face image upload failed after all retries", {
        error: error.message,
      });
      return NextResponse.json(
        {
          message:
            "Failed to upload face image. Please try again with a smaller image or over a stronger connection.",
          error: error.message,
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Upload ID card image with better retry policy
    let idCardImageUrl = null;
    try {
      log(deviceType, "INFO", "Starting ID card image upload");
      idCardImageUrl = await retryOperation(
        () => uploadImageToS3(idCardImage, "id_cards", studentID, deviceType),
        3, // max attempts
        1000, // initial delay in ms
        deviceType,
        "ID card image upload"
      );
    } catch (error) {
      log(
        deviceType,
        "ERROR",
        "ID card image upload failed after all retries",
        {
          error: error.message,
        }
      );
      return NextResponse.json(
        {
          message:
            "Failed to upload ID card image. Please try again with a smaller image or over a stronger connection.",
          error: error.message,
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Now that images are uploaded, complete registration
    log(
      deviceType,
      "INFO",
      "Both images uploaded successfully, completing registration"
    );

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Hash password with proper error handling
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      log(deviceType, "ERROR", "Password hashing failed", {
        error: hashError.message,
        stack: hashError.stack,
      });
      return NextResponse.json(
        {
          message: "Registration processing error",
          error: "Failed to secure password",
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert user record with transaction
    try {
      // Start transaction for data consistency
      await connection.beginTransaction();

      log(deviceType, "INFO", "Inserting user record to database");
      const [insertResult] = await connection.execute(
        "INSERT INTO users (email, name, student_id, password, verification_token, token_expiry, is_verified, face_image_url, id_card_image_url, device_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
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
          deviceType,
        ]
      );

      log(deviceType, "INFO", "User inserted into database", {
        userId: insertResult.insertId,
        affectedRows: insertResult.affectedRows,
      });

      // Commit transaction
      await connection.commit();

      // Send verification email
      try {
        log(deviceType, "INFO", "Sending verification email", { email });
        await sendVerificationEmail(email, verificationToken);
        log(deviceType, "INFO", "Verification email sent", { email });
      } catch (emailError) {
        log(deviceType, "WARN", "Failed to send verification email", {
          error: emailError.message,
          stack: emailError.stack,
        });
        // Continue with registration even if email fails
      }

      // Calculate total processing time
      const totalTime = Date.now() - startTime;
      log(deviceType, "INFO", "Registration completed successfully", {
        email,
        totalProcessingTimeMs: totalTime,
      });

      return NextResponse.json(
        {
          message:
            "Registration successful! Please check your email to verify your account.",
          success: true,
          processingTime: totalTime,
        },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (dbError) {
      // Rollback transaction if error occurs
      try {
        await connection.rollback();
      } catch (rollbackError) {
        log(deviceType, "ERROR", "Transaction rollback failed", {
          error: rollbackError.message,
        });
      }

      log(deviceType, "ERROR", "Database insertion error", {
        error: dbError.message,
        code: dbError.code,
        sqlState: dbError.sqlState,
      });

      return NextResponse.json(
        { message: "Failed to complete registration", error: dbError.message },
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // Generic error handler for uncaught exceptions
    log(deviceType, "CRITICAL", "Unhandled registration error", {
      error: error.message,
      stack: error.stack,
      totalProcessingTimeMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        message: "Registration process failed due to an unexpected error",
        error: error.message,
        // Add a request ID to help with troubleshooting
        requestId: uuidv4(),
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
