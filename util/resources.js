import { connection } from "./db";
import { getCurrentUser } from "@/lib/getCurrentUser";
export async function getResources() {
  const [rows] = await connection.execute(
    "SELECT * FROM resources order by id desc"
  );
  return rows;
}
export async function getCoins() {
  const user = await getCurrentUser();
  const [coins] = await connection.execute(
    "SELECT code_coins FROM users where id = ?",
    [user.id]
  );
  return coins;
}

export async function getPurchasedResources() {
  const user = await getCurrentUser();
  const [rows] = await connection.execute(
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
       WHERE p.user_id = ?
       ORDER BY p.purchased_at DESC`,
    [user.id]
  );
  return rows;
}
