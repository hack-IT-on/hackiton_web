import { NextResponse } from "next/server";
import { z } from "zod";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";

const purchaseSchema = z.object({
  resourceId: z.number(),
});

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log(body);
    const { resourceId } = purchaseSchema.parse(body);

    // await connection.beginTransaction();

    try {
      // Get user's current coins and resource price
      const userRows = await connection.query(
        "SELECT code_coins FROM users WHERE id = $1",
        [user?.id]
      );

      const resourceRows = await connection.query(
        "SELECT price, resource_link FROM resources WHERE id = $1",
        [resourceId]
      );

      if (!userRows.rows[0]) {
        throw new Error("User not found");
      }

      if (!resourceRows.rows[0]) {
        throw new Error("Resource not found");
      }

      const userCoins = userRows.rows[0].code_coins;
      const resourcePrice = resourceRows.rows[0].price;

      // Check if user has enough coins
      if (userCoins < resourcePrice) {
        throw new Error("Insufficient coins");
      }

      // Check if user already owns the resource
      const purchaseRows = await connection.query(
        "SELECT id FROM purchases WHERE user_id = $1 AND resource_id = $2",
        [user?.id, resourceId]
      );

      if (purchaseRows.rows[0]) {
        throw new Error("You already own this resource");
      }

      // Deduct coins from user
      await connection.query(
        "UPDATE users SET code_coins = code_coins - $1 WHERE id = $2",
        [resourcePrice, user?.id]
      );

      // Record purchase
      await connection.query(
        "INSERT INTO purchases (user_id, resource_id, purchased_at) VALUES ($1, $2, NOW())",
        [user?.id, resourceId]
      );

      // await connection.commit();

      return NextResponse.json({
        message: "Purchase successful",
        resource_link: resourceRows.rows[0].resource_link,
      });
    } catch (error) {
      // await connection.rollback();
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
