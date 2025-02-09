import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resourceId = params.resourceId;

    // Verify purchase
    const [purchaseRows] = await connection.execute(
      `SELECT p.id 
       FROM purchases p
       WHERE p.user_id = ? AND p.resource_id = ?`,
      [user?.id, resourceId]
    );

    if (!purchaseRows[0]) {
      return NextResponse.json(
        { error: "Resource not purchased" },
        { status: 403 }
      );
    }

    // Get resource download URL
    const [resourceRows] = await connection.execute(
      "SELECT resource_link FROM resources WHERE id = ?",
      [resourceId]
    );

    if (!resourceRows[0] || !resourceRows[0].resource_link) {
      return NextResponse.json(
        { error: "Resource download link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      downloadUrl: resourceRows[0].resource_link,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
