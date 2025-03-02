"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="rounded-full bg-red-100 p-3">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Unauthorized Access
              </h1>
              <p className="text-gray-500">
                You don&apos;t have permission to access this page. Please
                contact your administrator if you believe this is a mistake.
              </p>
            </div>

            <Alert variant="destructive" className="mt-4">
              <AlertTitle className="flex items-center gap-2">
                Access Denied
              </AlertTitle>
              <AlertDescription>
                This area is restricted to administrators only.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <Button
                variant="outline"
                className="w-full sm:w-1/2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                className="w-full sm:w-1/2"
                onClick={() => router.push("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Home Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
