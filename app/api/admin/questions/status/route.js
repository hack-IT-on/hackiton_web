import { NextResponse } from "next/server";
import { connection } from "@/util/db";
import checkAndAwardBadges from "@/util/badgeUtils";
import {
  sendQuestionApprovalEmail,
  sendQuestionRejectedEmail,
} from "@/util/email";

export async function PUT(request) {
  try {
    const { id, status } = await request.json();
    // console.log(id, status);

    await connection.query(
      "UPDATE questions SET status = $1, approved_at = $2 WHERE id = $3",
      [status, status === "approved" ? new Date() : null, id]
    );

    const getUserResult = await connection.query(
      "SELECT title, user_id FROM questions WHERE id = $1",
      [id]
    );
    const getUser = getUserResult.rows;

    const userResult = await connection.query(
      "SELECT name, email FROM users WHERE id = $1",
      [getUser[0].user_id]
    );
    const row = userResult.rows;

    const questionResult = await connection.query(
      "SELECT title FROM questions WHERE user_id = $1 AND id = $2",
      [getUser[0].user_id, id]
    );
    const question_row = questionResult.rows;

    if (status === "approved") {
      const activityResult = await connection.query(
        "SELECT * FROM activities WHERE name = $1",
        ["forum_post"]
      );
      const activity = activityResult.rows;

      await connection.query(
        "INSERT INTO user_activities (user_id, activity_id, name) VALUES ($1, $2, $3)",
        [getUser[0].user_id, activity[0].id, "Forum post: " + getUser[0].title]
      );

      await connection.query(
        "UPDATE users SET total_points = total_points + $1, code_coins = code_coins + $2, points_created_at = CURRENT_TIMESTAMP WHERE id = $3",
        [activity[0].points, activity[0].coins_reward, getUser[0].user_id]
      );

      await sendQuestionApprovalEmail(
        row[0].email,
        row[0].name,
        question_row[0].title
      );

      await checkAndAwardBadges(getUser[0].user_id, "forum_post");
    }

    if (status === "rejected") {
      await sendQuestionRejectedEmail(
        row[0].email,
        row[0].name,
        question_row[0].title
      );
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
