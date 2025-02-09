import LeetcodeProfile from "@/components/LeetcodeProfile";
import { LeetCode } from "leetcode-query";
import { getCurrentUser } from "@/lib/getCurrentUser";
export default async function ProfilePage({ params }) {
  const user = await getCurrentUser();
  const leetcode = new LeetCode();
  const leetcode_user = await leetcode.user(user?.leetcode_username);
  return <LeetcodeProfile data={leetcode_user} />;
}
