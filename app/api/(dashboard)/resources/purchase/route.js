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
      const [userRows] = await connection.execute(
        "SELECT code_coins FROM users WHERE id = ?",
        [user.id]
      );

      const [resourceRows] = await connection.execute(
        "SELECT price, resource_link FROM resources WHERE id = ?",
        [resourceId]
      );

      if (!userRows[0]) {
        throw new Error("User not found");
      }

      if (!resourceRows[0]) {
        throw new Error("Resource not found");
      }

      const userCoins = userRows[0].code_coins;
      const resourcePrice = resourceRows[0].price;

      // Check if user has enough coins
      if (userCoins < resourcePrice) {
        throw new Error("Insufficient coins");
      }

      // Check if user already owns the resource
      const [purchaseRows] = await connection.execute(
        "SELECT id FROM purchases WHERE user_id = ? AND resource_id = ?",
        [user.id, resourceId]
      );

      if (purchaseRows[0]) {
        throw new Error("You already own this resource");
      }

      // Deduct coins from user
      await connection.execute(
        "UPDATE users SET code_coins = code_coins - ? WHERE id = ?",
        [resourcePrice, user.id]
      );

      // Record purchase
      await connection.execute(
        "INSERT INTO purchases (user_id, resource_id, purchased_at) VALUES (?, ?, NOW())",
        [user.id, resourceId]
      );

      // await connection.commit();

      return NextResponse.json({
        message: "Purchase successful",
        resource_link: resourceRows[0].resource_link,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
