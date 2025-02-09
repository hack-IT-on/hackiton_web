import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default function LoginPage() {
  const user = getCurrentUser();
  return <LoginForm user={user} />;
}
