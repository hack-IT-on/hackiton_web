import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import checkAndAwardBadges from "@/util/badgeUtils";

export async function PUT(request) {
  try {
    const { id, status } = await request.json();
    // console.log(id, status);

    await connection.execute(
      "UPDATE questions SET status = ?, approved_at = ? WHERE id = ?",
      [status, status === "approved" ? new Date() : null, id]
    );

    const [getUser] = await connection.execute(
      "select title, user_id from questions where id = ?",
      [id]
    );

    if (status === "approved") {
      const [activity] = await connection.execute(
        "SELECT * FROM activities WHERE name = ?",
        ["forum_post"]
      );

      await connection.execute(
        "INSERT INTO user_activities (user_id, activity_id, name) VALUES (?, ?, ?)",
        [getUser[0].user_id, activity[0].id, "Forum post: " + getUser[0].title]
      );

      await connection.execute(
        "UPDATE users SET total_points = total_points + ?, code_coins = code_coins + ?, points_created_at = current_timestamp() WHERE id = ?",
        [activity[0].points, activity[0].coins_reward, getUser[0].user_id]
      );

      await checkAndAwardBadges(getUser[0].user_id, "forum_post");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
