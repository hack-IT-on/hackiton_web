import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import {
  sendAccountApprovalEmail,
  sendAccountRejectedEmail,
} from "@/util/email";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    try {
      const [result] = await connection.query(
        `UPDATE users SET 
         name = ?, 
         email = ?, 
         role = ?, 
         is_approved = ?,
         student_id = ?, 
         github_username = ?, 
         leetcode_username = ?,
         total_points = ?,
         code_coins = ?
         WHERE id = ?`,
        [
          data.name,
          data.email,
          data.role,
          data.approved,
          data.student_id,
          data.github_username,
          data.leetcode_username,
          data.total_points,
          data.code_coins,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch the updated user
      const [updatedUser] = await connection.query(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      if (data.approved === 1) {
        await sendAccountApprovalEmail(data.email, data.name);
      }

      return NextResponse.json(updatedUser[0]);
    } finally {
      //   connection.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    try {
      const [result] = await connection.query(
        "DELETE FROM users WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await sendAccountRejectedEmail(email, name);

      return NextResponse.json({ message: "User deleted successfully" });
    } finally {
      //   connection.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
