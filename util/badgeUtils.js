import { connection } from "./db";
export default async function checkAndAwardBadges(userId, activityType) {
  const [activityCount] = await connection.execute(
    `SELECT COUNT(*) as count FROM user_activities ua
     JOIN activities a ON ua.activity_id = a.id
     WHERE ua.user_id = ? AND a.name = ?`,
    [userId, activityType]
  );
  const [eligibleBadges] = await connection.execute(
    `SELECT * FROM badges 
     WHERE activity_type = ? 
     AND required_activites_count <= ?
     AND id NOT IN (
         SELECT badge_id FROM user_badges WHERE user_id = ?
     )`,
    [activityType, activityCount[0].count, userId]
  );

  for (const badge of eligibleBadges) {
    await connection.execute(
      "INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)",
      [userId, badge.id]
    );
  }
}
