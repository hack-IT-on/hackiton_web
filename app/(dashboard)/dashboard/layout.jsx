import MandatoryOAuthPopup from "@/components/MandatoryOAuthPopup";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function DashboardLayout({ children }) {
  // Get the current user data
  const user = await getCurrentUser();

  // Show loading state until we have user data
  if (!user) {
    return <div>Loading...</div>;
  }

  // Check if GitHub username OR LeetCode username is null
  const shouldShowPopup = !user?.github_username || !user?.leetcode_username;

  return (
    <>
      {shouldShowPopup && <MandatoryOAuthPopup user={user} />}
      {children}
    </>
  );
}
