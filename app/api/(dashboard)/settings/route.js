import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  try {
    const result = await connection.query(
      "SELECT name, student_id, github_username, leetcode_username, email FROM users WHERE id = $1",
      [user?.id]
    );
    return NextResponse.json(result.rows[0]);
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
      const result = await connection.query(
        "SELECT password FROM users WHERE id = $1",
        [user?.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isValid = await bcrypt.compare(
        currentPassword,
        result.rows[0].password
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
      // Convert the field updates to PostgreSQL parameterized format
      const updates = Object.keys(filteredFields);
      const setClause = updates
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

      const values = [...Object.values(filteredFields), user?.id];

      // In PostgreSQL, the user ID is the last parameter
      const query = `UPDATE users SET ${setClause} WHERE id = $${
        updates.length + 1
      }`;
      await connection.query(query, values);
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
