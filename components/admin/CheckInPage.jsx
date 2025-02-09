import { getCurrentUser } from "@/lib/getCurrentUser";
import CheckInComponent from "../CheckInComponent";

export default async function CheckInPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return <CheckInComponent />;
  } else {
    return "This page only for admin";
  }
}
