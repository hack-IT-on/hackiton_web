import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const rows = await connection.query(
      "SELECT name, student_id, github_username, leetcode_username, email FROM users WHERE id = $1",
      // Replace with actual user ID from session
      [user?.id]
    );
    return NextResponse.json(rows.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const user = await getCurrentUser();
  try {
    const data = await request.json();
    const { currentPassword, newPassword, ...profileData } = data;

    // If password change is requested, validate current password
    if (currentPassword && newPassword) {
      const users = await connection.query(
        "SELECT password FROM users WHERE id = $1",
        [user?.id]
      );
      const isValid = await bcrypt.compare(
        currentPassword,
        users.rows[0].password
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid current password" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await connection.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        user?.id,
      ]);
    }

    // Only update non-empty profile fields
    const filteredFields = Object.entries(profileData)
      .filter(([_, value]) => value !== undefined && value !== "")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(filteredFields).length > 0) {
      const setClause = Object.keys(filteredFields)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(filteredFields), user?.id];

      const query = `UPDATE users SET ${setClause} WHERE id = $1`;
      await connection.query(query, values);
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
