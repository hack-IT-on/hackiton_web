import { connection } from "./db";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function getResources() {
  try {
    const rows = await connection.query(
      "SELECT * FROM resources ORDER BY id DESC"
    );
    return rows.rows || [];
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
}

export async function getCoins() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return [{ code_coins: 0 }]; // Return default value if no user
    }

    const coins = await connection.query(
      "SELECT code_coins FROM users WHERE id = $1",
      [user.id]
    );

    return coins.rows || [{ code_coins: 0 }];
  } catch (error) {
    console.error("Error fetching coins:", error);
    return [{ code_coins: 0 }];
  }
}

export async function getPurchasedResources() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return []; // Return empty array if no user
    }

    const rows = await connection.query(
      `SELECT 
        r.id,
        r.name,
        r.description,
        r.resource_link,
        r.image_link,
        p.id as purchase_id,
        p.purchased_at,
        p.resource_id
       FROM purchases p
       JOIN resources r ON p.resource_id = r.id
       WHERE p.user_id = $1
       ORDER BY p.purchased_at DESC`,
      [user.id]
    );

    return rows.rows || [];
  } catch (error) {
    console.error("Error fetching purchased resources:", error);
    return [];
  }
}
