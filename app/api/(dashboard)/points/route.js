import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import checkAndAwardBadges from "@/util/badgeUtils";

export async function POST(req) {
  const user = await getCurrentUser();
  try {
    const userId = user.id;
    const {
      activityName,
      qr_code_text,
      event_id,
      activityDescription,
      user_id,
    } = await req.json();
    // console.log(activityName);
    // console.log(qr_code_text + " " + event_id);

    // Get activity details
    const [activity] = await connection.execute(
      "SELECT * FROM activities WHERE name = ?",
      [activityName]
    );

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    try {
      if (activityName === "attend_event" && event_id) {
        const [rows] = await connection.execute(
          "SELECT e.title, er.user_id FROM event_registrations er INNER JOIN events e ON er.event_id = e.id where er.event_id = ? and er.qr_code_secret = ?",
          [event_id, qr_code_text]
        );
        const registration = rows[0];
        await connection.execute(
          "INSERT INTO user_activities (user_id, activity_id, name) VALUES (?, ?, ?)",
          [
            registration.user_id,
            activity[0].id,
            "Attended event: " + registration.title,
          ]
        );

        await connection.execute(
          "UPDATE users SET total_points = total_points + ?, code_coins = code_coins + ?, points_created_at = current_timestamp() WHERE id = ?",
          [activity[0].points, activity[0].coins_reward, registration.user_id]
        );

        await checkAndAwardBadges(registration.user_id, activityName);
      } else {
        await connection.execute(
          "INSERT INTO user_activities (user_id, activity_id, name) VALUES (?, ?, ?)",
          [userId, activity[0].id, activityDescription]
        );

        await connection.execute(
          "UPDATE users SET total_points = total_points + ?, code_coins = code_coins + ?, points_created_at = current_timestamp() WHERE id = ?",
          [activity[0].points, activity[0].coins_reward, userId]
        );

        await checkAndAwardBadges(userId, activityName);
      }

      // await connection.execute("COMMIT");

      return NextResponse.json({ success: true });
    } catch (error) {
      // await connection.execute("ROLLBACK");
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to award points" },
      { status: 500 }
    );
  }
}
