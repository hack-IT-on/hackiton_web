import { connection } from "@/util/db";
import QuestionsPage from "@/components/admin/pages/QuestionsPage";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function QuestionPage() {
  const user = await getCurrentUser();
  const rows = await connection.query(
    "SELECT * FROM questions ORDER BY created_at DESC"
  );

  if (user?.role === "admin")
    return (
      <div className="container mx-auto py-10">
        <QuestionsPage initialQuestions={rows.rows} />
      </div>
    );
  else return <center>You're not an admin.</center>;
}
