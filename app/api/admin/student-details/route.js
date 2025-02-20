import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { read, utils } from "xlsx";

// Helper function to process the uploaded file with your column mapping
async function processFile(buffer) {
  const workbook = read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = utils.sheet_to_json(worksheet);

  return data.map((row) => ({
    roll_no: row["ROLL NO"]?.toString(),
    name: row["STUDENTS NAME"],
    semester: row["SEMESTER"],
    mobile_number: row["MOBILE NO."]?.toString(),
    course_name: row["COURSE NAME"],
  }));
}

// Helper function to validate student data
function validateStudent(student) {
  if (
    !student.roll_no ||
    !student.name ||
    !student.semester ||
    !student.mobile_number ||
    !student.course_name
  ) {
    throw new Error(
      `Missing required fields for student: ${JSON.stringify(student)}`
    );
  }

  // Basic mobile number validation (adjust pattern as needed)
  const mobilePattern = /^\d{10}$/;
  if (!mobilePattern.test(student.mobile_number.replace(/[-\s]/g, ""))) {
    throw new Error(
      `Invalid mobile number format for student: ${student.name}`
    );
  }
}

export async function POST(request) {
  try {
    // Ensure the request is multipart/form-data
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process the file
    const students = await processFile(buffer);

    // Validate all students
    // students.forEach(validateStudent);

    // Prepare the insert query
    const insertSQL = `
      INSERT INTO students (roll_no, name, semester, mobile_number, course_name)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        semester = VALUES(semester),
        mobile_number = VALUES(mobile_number),
        course_name = VALUES(course_name)
    `;

    // Insert all students
    let rowsInserted = 0;
    let rowsUpdated = 0;

    for (const student of students) {
      try {
        const [result] = await connection.execute(insertSQL, [
          student.roll_no,
          student.name,
          student.semester,
          student.mobile_number,
          student.course_name,
        ]);

        if (result.affectedRows === 1 && result.changedRows === 0) {
          rowsInserted++;
        } else if (result.changedRows === 1) {
          rowsUpdated++;
        }
      } catch (error) {
        console.error(`Error processing student ${student.roll_no}:`, error);
        throw error;
      }
    }

    return NextResponse.json({
      message: "File processed successfully",
      rowsInserted,
      rowsUpdated,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const [response] = await connection.execute("select * from students ");
  return NextResponse.json(response);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
