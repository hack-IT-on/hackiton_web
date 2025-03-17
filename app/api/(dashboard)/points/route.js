import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import checkAndAwardBadges from "@/util/badgeUtils";

export async function POST(req) {
  const user = await getCurrentUser();
  try {
    const userId = user?.id;
    const {
      activityName,
      qr_code_text,
      event_id,
      activityDescription,
      user_id,
    } = await req.json();

    const activityResult = await connection.query(
      "SELECT * FROM activities WHERE name = $1",
      [activityName]
    );

    console.log(qr_code_text);

    const activity = activityResult.rows;

    if (activity.length === 0) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    try {
      await connection.query("BEGIN");

      if (activityName === "attend_event" && event_id) {
        const registrationResult = await connection.query(
          "SELECT e.title, er.user_id FROM event_registrations er INNER JOIN events e ON er.event_id = e.id WHERE er.event_id = $1 AND er.qr_code_secret_out = $2",
          [event_id, qr_code_text]
        );

        if (registrationResult.rows.length === 0) {
          await connection.query("ROLLBACK");
          return NextResponse.json(
            { error: "Registration not found" },
            { status: 404 }
          );
        }

        const registration = registrationResult.rows[0];

        await connection.query(
          "INSERT INTO user_activities (user_id, activity_id, name) VALUES ($1, $2, $3)",
          [
            registration.user_id,
            activity[0].id,
            "Attended event: " + registration.title,
          ]
        );

        await connection.query(
          "UPDATE users SET total_points = total_points + $1, code_coins = code_coins + $2, points_created_at = CURRENT_TIMESTAMP WHERE id = $3",
          [activity[0].points, activity[0].coins_reward, registration.user_id]
        );

        await checkAndAwardBadges(registration.user_id, activityName);
      } else {
        await connection.query(
          "INSERT INTO user_activities (user_id, activity_id, name) VALUES ($1, $2, $3)",
          [userId, activity[0].id, activityDescription]
        );

        await connection.query(
          "UPDATE users SET total_points = total_points + $1, code_coins = code_coins + $2, points_created_at = CURRENT_TIMESTAMP WHERE id = $3",
          [activity[0].points, activity[0].coins_reward, userId]
        );

        await checkAndAwardBadges(userId, activityName);
      }

      await connection.query("COMMIT");

      return NextResponse.json({ success: true });
    } catch (error) {
      await connection.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Award points error:", error);
    return NextResponse.json(
      { error: "Failed to award points" },
      { status: 500 }
    );
  }
}
