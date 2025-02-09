import ResetPasswordForm from "@/components/ResetPasswordForm";
export default function ResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
