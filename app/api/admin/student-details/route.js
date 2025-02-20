import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { read, utils } from "xlsx";

// Constants for batch processing
const BATCH_SIZE = 100;
const TIMEOUT_DURATION = 300000; // 5 minutes in milliseconds

// Helper function to process the uploaded file with batch processing
async function processFile(buffer) {
  const workbook = read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(worksheet, { raw: false, defval: "" });

  return data.map((row) => ({
    roll_no: row["ROLL NO"]?.toString().trim(),
    name: row["STUDENTS NAME"]?.toString().trim(),
    semester: row["SEMESTER"]?.toString().trim(),
    mobile_number: row["MOBILE NO."]?.toString().replace(/[-\s]/g, "").trim(),
    course_name: row["COURSE NAME"]?.toString().trim(),
  }));
}

// Helper function to validate student data
function validateStudent(student) {
  const errors = [];

  if (!student.roll_no) errors.push("Roll number is required");
  if (!student.name) errors.push("Name is required");
  if (!student.semester) errors.push("Semester is required");
  if (!student.mobile_number) errors.push("Mobile number is required");
  if (!student.course_name) errors.push("Course name is required");

  // Basic mobile number validation
  const mobilePattern = /^\d{10}$/;
  if (student.mobile_number && !mobilePattern.test(student.mobile_number)) {
    errors.push("Invalid mobile number format");
  }

  return errors;
}

// Helper function to process students in batches
async function processBatch(students, connection) {
  const insertSQL = `
    INSERT INTO students (roll_no, name, semester, mobile_number, course_name)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      semester = VALUES(semester),
      mobile_number = VALUES(mobile_number),
      course_name = VALUES(course_name)
  `;

  const values = students.map((s) => [
    s.roll_no,
    s.name,
    s.semester,
    s.mobile_number,
    s.course_name,
  ]);

  const [result] = await connection.query(insertSQL, [values]);
  return {
    inserted: result.affectedRows - result.changedRows,
    updated: result.changedRows,
  };
}

export async function POST(request) {
  try {
    // Set timeout for the entire operation
    const timeout = setTimeout(() => {
      throw new Error("Operation timed out");
    }, TIMEOUT_DURATION);

    // Verify request format
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get and validate file
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Process file
    const buffer = Buffer.from(await file.arrayBuffer());
    const students = await processFile(buffer);

    // Validate data format
    const validationErrors = [];
    students.forEach((student, index) => {
      const errors = validateStudent(student);
      if (errors.length > 0) {
        validationErrors.push(`Row ${index + 1}: ${errors.join(", ")}`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validation errors",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // Process in batches
    let totalInserted = 0;
    let totalUpdated = 0;

    // Process in batches
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      const { inserted, updated } = await processBatch(batch, connection);
      totalInserted += inserted;
      totalUpdated += updated;
    }

    clearTimeout(timeout);

    return NextResponse.json({
      message: "File processed successfully",
      totalProcessed: students.length,
      rowsInserted: totalInserted,
      rowsUpdated: totalUpdated,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    // if (connection) {
    //   await connection.release();
    // }
  }
}

export async function GET() {
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM students ORDER BY roll_no LIMIT 1000"
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch students",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    maxDuration: 300, // 5 minutes in seconds
  },
};
