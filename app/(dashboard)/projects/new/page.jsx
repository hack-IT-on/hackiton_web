import AddNewProject from "@/components/AddNewProject";
import { getCurrentUser } from "@/lib/getCurrentUser";
export default async function NewProjectPage() {
  const user = await getCurrentUser();
  if (user?.upload_project) return <AddNewProject />;
  else return <center>Your are not allow to add project.</center>;
}
