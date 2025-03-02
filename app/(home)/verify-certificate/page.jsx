"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Search, Shield } from "lucide-react";

export default function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState(null);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setError(null);
    setEvent(null);

    try {
      const response = await fetch("/api/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify certificate");
      }

      setResult(data.registration);
      setEvent(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold mb-1">
            Certificate Verification Portal
          </h1>
          <p className="">
            Verify the authenticity of your certificates instantly
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Verify Certificate</CardTitle>
            <CardDescription>
              Enter your certificate ID below to check its validity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Enter Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
              <Button
                type="submit"
                className="w-full transition-all"
                disabled={isLoading || !certificateId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </form>

            {result && (
              <Alert className="mt-6  transition-all">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800 font-semibold">
                  Certificate Verified Successfully
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-3 space-y-2 text-green-700">
                    <div className="flex items-center">
                      <span className="font-medium w-40">Name:</span>
                      <span>{result.user_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-40">Event:</span>
                      <span>{event.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-40">Issue Date:</span>
                      <span>{formatDate(event.certificate_issue_date)}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert
                className="mt-6 bg-red-50 border-red-200"
                variant="destructive"
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800 font-semibold">
                  Verification Failed
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="justify-center text-sm text-gray-500">
            Secure verification powered by our certification system
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
