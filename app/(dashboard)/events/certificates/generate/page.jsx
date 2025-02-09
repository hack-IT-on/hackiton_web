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
import { Download } from "lucide-react";

export default function GeneratePage() {
  const [certificates, setCertificates] = useState([]);
  const [userName, setUserName] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/events/certificates")
      .then((res) => res.json())
      .then((data) => setCertificates(data.certificates));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setDownloading(true);
      const response = await fetch("/api/events/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: selectedCertificate,
        }),
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();

        // Create a Blob URL
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate.pdf`;

        // Programmatically click the link
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      const data = await response.json();
      if (response.ok) {
        setGeneratedPdfUrl(data.pdfUrl);
      }
    } catch (err) {
      console.log("ok");
    } finally {
      setDownloading(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <Loader2 className="w-8 h-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Event Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {certificates.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Select
                  value={selectedCertificate}
                  onValueChange={setSelectedCertificate}
                >
                  <SelectTrigger className="text-black">
                    <SelectValue placeholder="Select Certificate" />
                  </SelectTrigger>
                  <SelectContent className="text-black">
                    {certificates.map((cert) => (
                      <SelectItem
                        key={cert.id}
                        value={cert.id}
                        className="text-black"
                      >
                        {cert.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={downloading}>
                <Download className="w-4 h-4 mr-2" />
                {!downloading ? "Download Certificate" : "Downloading..."}
              </Button>
            </form>
          ) : (
            <center>"No Certificates to download!"</center>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
