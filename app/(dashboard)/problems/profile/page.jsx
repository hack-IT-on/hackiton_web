import LeetcodeProfile from "@/components/LeetcodeProfile";
import { LeetCode } from "leetcode-query";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage() {
  const users = await getCurrentUser();

  // Check if user exists and has a leetcode username
  if (!users?.leetcode_username) {
    // You can either redirect to an error page or show a message
    // Option 1: Redirect to an error page
    redirect("/profile/setup"); // Create this page to let users set their LeetCode username

    // Option 2: Return an error message component
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            LeetCode Profile Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            Please set up your LeetCode username in your profile settings to
            view this page.
          </p>
          <Link
            href="/profile/settings"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  try {
    const leetcode = new LeetCode();
    const leetcode_user = await leetcode.user(users?.leetcode_username);

    // Check if we got valid data back
    if (!leetcode_user || !leetcode_user?.matchedUser) {
      return (
        <div className="container mx-auto p-4">
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Invalid LeetCode Profile
            </h2>
            <p className="text-muted-foreground">
              We couldn't find your LeetCode profile. Please check if your
              username is correct.
            </p>
          </div>
        </div>
      );
    }

    return <LeetcodeProfile data={leetcode_user} />;
  } catch (error) {
    console.error("Error fetching LeetCode profile:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p className="text-muted-foreground">
            There was an error loading your LeetCode profile. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }
}
