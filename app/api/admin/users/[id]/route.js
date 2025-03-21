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
      // In PostgreSQL, use single quotes for string literals
      const { rows: userRows } = await connection.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
      );

      if (userRows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const previous_status = userRows[0].is_approved;

      // PostgreSQL uses $n parameters instead of ?
      const { rowCount } = await connection.query(
        `UPDATE users SET 
         name = $1, 
         email = $2, 
         role = $3, 
         is_approved = $4,
         student_id = $5, 
         github_username = $6, 
         leetcode_username = $7,
         total_points = $8,
         code_coins = $9
         WHERE id = $10
         RETURNING *`,
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

      if (rowCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Fetch the updated user
      const { rows: updatedUser } = await connection.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
      );

      if (
        (previous_status === 0 || previous_status === 2) &&
        data.approved === 1
      ) {
        await sendAccountApprovalEmail(data.email, data.name);
      }

      return NextResponse.json(updatedUser[0]);
    } finally {
      // Connection pooling is handled differently in pg
      // No need to release the client when using a pool
      // If you're using a single client, you might want to end it here
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
      // PostgreSQL uses $n parameters instead of ?
      const { rowCount } = await connection.query(
        "DELETE FROM users WHERE id = $1",
        [id]
      );

      if (rowCount === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await sendAccountRejectedEmail(email, name);

      return NextResponse.json({ message: "User deleted successfully" });
    } finally {
      // Connection pooling is handled differently in pg
      // No need to release the client when using a pool
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
