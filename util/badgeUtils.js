import { connection } from "./db";

export default async function checkAndAwardBadges(userId, activityType) {
  const activityCountResult = await connection.query(
    `SELECT COUNT(*) as count FROM user_activities ua
     JOIN activities a ON ua.activity_id = a.id
     WHERE ua.user_id = $1 AND a.name = $2`,
    [userId, activityType]
  );

  const activityCount = parseInt(activityCountResult.rows[0].count);

  const eligibleBadgesResult = await connection.query(
    `SELECT * FROM badges 
     WHERE activity_type = $1 
     AND required_activites_count <= $2
     AND id NOT IN (
         SELECT badge_id FROM user_badges WHERE user_id = $3
     )`,
    [activityType, activityCount, userId]
  );

  const eligibleBadges = eligibleBadgesResult.rows;

  for (const badge of eligibleBadges) {
    await connection.query(
      "INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)",
      [userId, badge.id]
    );
  }
}
