import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { read, utils } from "xlsx";

const BATCH_SIZE = 100;
const TIMEOUT_DURATION = 600000;

async function processFile(buffer) {
  try {
    const workbook = read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(worksheet, { raw: false, defval: "" });

    console.log("Excel data parsed successfully. Row count:", data.length);

    return data.map((row) => ({
      roll_no: row["ROLL NO"]?.toString().trim() || "",
      name: row["STUDENTS NAME"]?.toString().trim() || "",
      semester: row["SEMESTER"]?.toString().trim() || "",
      course_name: row["COURSE NAME"]?.toString().trim() || "",
      email: row["EMAIL"]?.toString().trim() || "",
    }));
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw new Error(`Failed to process Excel file: ${error.message}`);
  }
}

function validateStudent(student) {
  const errors = [];

  if (!student.roll_no) errors.push("Roll number is required");
  if (!student.name) errors.push("Name is required");
  if (!student.semester) errors.push("Semester is required");
  if (!student.email) errors.push("Email is required");
  if (!student.course_name) errors.push("Course name is required");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (student.email && !emailPattern.test(student.email)) {
    errors.push("Invalid email format");
  }

  return errors;
}

async function processBatch(students, conn) {
  let totalInserted = 0;
  let totalUpdated = 0;

  const query = {
    text: `
      INSERT INTO students (roll_no, name, semester, email, course_name)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (roll_no) DO UPDATE SET
        name = $2,
        semester = $3,
        email = $4,
        course_name = $5
      RETURNING (xmax = 0) AS inserted
    `,
  };

  for (const student of students) {
    try {
      query.values = [
        student.roll_no,
        student.name,
        student.semester,
        student.email,
        student.course_name,
      ];

      const result = await conn.query(query);

      if (result.rows[0].inserted) {
        totalInserted++;
      } else {
        totalUpdated++;
      }
    } catch (error) {
      console.error("Error processing student:", student.roll_no, error);
    }
  }

  return {
    inserted: totalInserted,
    updated: totalUpdated,
  };
}

export async function POST(request) {
  let timeoutId = null;

  try {
    // Set timeout
    timeoutId = setTimeout(() => {
      console.error("Operation timed out after", TIMEOUT_DURATION, "ms");
    }, TIMEOUT_DURATION);

    console.log("Starting file upload process");

    // Check content type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart/form-data")) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Invalid content type:", contentType);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("No file found in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received. Size:", file.size, "bytes");

    // Process file
    const buffer = Buffer.from(await file.arrayBuffer());
    const students = await processFile(buffer);

    if (!students || students.length === 0) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("No student records found in file");
      return NextResponse.json(
        { error: "No student records found in file" },
        { status: 400 }
      );
    }

    console.log("Found", students.length, "student records");

    // Validate students
    const validationErrors = [];
    students.forEach((student, index) => {
      const errors = validateStudent(student);
      if (errors.length > 0) {
        validationErrors.push(`Row ${index + 2}: ${errors.join(", ")}`);
      }
    });

    if (validationErrors.length > 0) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Validation errors:", validationErrors.length);
      return NextResponse.json(
        {
          error: "Validation errors",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    console.log("All records passed validation");

    // Process in batches
    let totalInserted = 0;
    let totalUpdated = 0;

    // Verify database connection
    await connection.query("SELECT 1");
    console.log("Database connection verified");

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(
          students.length / BATCH_SIZE
        )}`
      );

      const { inserted, updated } = await processBatch(batch, connection);
      totalInserted += inserted;
      totalUpdated += updated;

      console.log(
        `Batch processed. Inserted: ${inserted}, Updated: ${updated}`
      );
    }

    if (timeoutId) clearTimeout(timeoutId);

    console.log("File processing completed successfully");
    return NextResponse.json({
      message: "File processed successfully",
      totalProcessed: students.length,
      rowsInserted: totalInserted,
      rowsUpdated: totalUpdated,
    });
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        message: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await connection.query("SELECT * FROM students");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
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
    maxDuration: 600,
  },
};
