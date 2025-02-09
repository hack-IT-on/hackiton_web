import ProfileComponent from "@/components/ProfileComponent";
import { getCurrentUser } from "@/lib/getCurrentUser";
export default async function Profile() {
  const user = await getCurrentUser();
  return <ProfileComponent user={user} />;
}
