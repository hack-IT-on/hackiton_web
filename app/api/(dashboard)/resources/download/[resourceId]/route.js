import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resourceId = await params.resourceId;

    // Verify purchase
    const purchaseRows = await connection.query(
      `SELECT p.id 
       FROM purchases p
       WHERE p.user_id = $1 AND p.resource_id = $2`,
      [user?.id, resourceId]
    );

    if (!purchaseRows.rows[0]) {
      return NextResponse.json(
        { error: "Resource not purchased" },
        { status: 403 }
      );
    }

    // Get resource download URL
    const resourceRows = await connection.query(
      "SELECT resource_link FROM resources WHERE id = $1",
      [resourceId]
    );

    if (!resourceRows.rows[0] || !resourceRows.rows[0].resource_link) {
      return NextResponse.json(
        { error: "Resource download link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: resourceRows.rows[0].resource_link,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
