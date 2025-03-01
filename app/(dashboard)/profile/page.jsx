import ProfileComponent from "@/components/ProfileComponent";
import { getCurrentUser } from "@/lib/getCurrentUser";
import DashboardLayout from "../dashboard/layout";
export default async function Profile() {
  const user = await getCurrentUser();
  return (
    <>
      <DashboardLayout />
      <ProfileComponent user={user} />
    </>
  );
}
