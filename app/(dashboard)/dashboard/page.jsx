import Dashboard from "@/components/Dashboard";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { LeetCode } from "leetcode-query";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const leetcode = new LeetCode();
  const daily = await leetcode.daily();
  return <Dashboard user={user} daily={daily} />;
}
