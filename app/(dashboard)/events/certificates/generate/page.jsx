"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Award,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function GeneratePage() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/events/certificates");
      const data = await res.json();
      setCertificates(data.certificates);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to load certificates. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCertificate) {
      setStatus({
        type: "error",
        message: "Please select a certificate first",
      });
      return;
    }

    try {
      setDownloading(true);
      setStatus({ type: "", message: "" });

      const response = await fetch("/api/events/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: selectedCertificate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate certificate");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get certificate name for the filename
      const certificate = certificates.find(
        (cert) => cert.id === selectedCertificate
      );
      // Add fallback name if certificate name is undefined
      const certificateName = certificate?.name || "certificate";
      const fileName = `${certificateName.replace(/\s+/g, "_")}.pdf`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus({
        type: "success",
        message: "Certificate downloaded successfully!",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: "Failed to download certificate. Please try again.",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center bg-gradient-to-r ">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl font-bold ">
              Event Certificates
            </CardTitle>
          </div>
          <p className="">Download your event participation certificates</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {status.message && (
            <Alert
              variant={status.type === "error" ? "destructive" : "default"}
            >
              {status.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {certificates.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium ">
                  Select Certificate
                </Label>
                <Select
                  value={selectedCertificate}
                  onValueChange={setSelectedCertificate}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a certificate" />
                  </SelectTrigger>
                  <SelectContent>
                    {certificates.map((cert) => (
                      <SelectItem key={cert.id} value={cert.id}>
                        {cert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={downloading || !selectedCertificate}
                className="w-full"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {downloading ? "Downloading..." : "Download Certificate"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No certificates available for download
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check back later or contact support if you think this is an
                error
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
