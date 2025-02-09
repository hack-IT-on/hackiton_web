import { LeetCode } from "leetcode-query";

export default async function ProblemNewPage() {
  const leetcode = new LeetCode();
  const user = await leetcode.user("dipakbiswa");
  const problems = await leetcode.problems();
  // const daily = await leetcode.daily();
  const submissions = await leetcode.recent_submissions("dipakbiswa");
  console.log(user);
  return "user";
}
