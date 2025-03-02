import GamificationDashboard from "@/components/GamificationDashboard";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function LeaderBoardPage() {
  const user = await getCurrentUser();
  return <GamificationDashboard logedUser={user} />;
}
