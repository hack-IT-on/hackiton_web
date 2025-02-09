import UsersPage from "@/components/admin/pages/UsersPage";
import { getCurrentUser } from "@/lib/getCurrentUser";
export default async function UserPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") return <UsersPage />;
  else return <center>You're not an admin.</center>;
}
