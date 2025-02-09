import { getCurrentUser } from "@/lib/getCurrentUser";
import CheckOutComponent from "../CheckOutComponent";

export default async function CheckOutPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    return <CheckOutComponent />;
  } else {
    return "This page only for admin";
  }
}
