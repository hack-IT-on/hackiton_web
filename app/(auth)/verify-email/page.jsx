import VerifyEmailPage from "@/components/VerifyEmailPage";
export default function ResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
