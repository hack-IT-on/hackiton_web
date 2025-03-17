"use client";
import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, XCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const QRCodeScanner = ({ eventId, eventData }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(
        (data) => {
          setScannedText(data);
          scanner.clear();
          setScanning(false);
          handleQRScan(data);
        },
        (err) => {
          if (err?.message?.includes("permission")) {
            setError(
              "Error accessing camera. Please make sure you have granted camera permissions."
            );
            scanner.clear();
            setScanning(false);
          }
        }
      );

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [scanning]);

  const toggleScanner = () => {
    setScanning(!scanning);
    setError("");
    setIsSuccess(false);
    if (!scanning) {
      setScannedText("");
    }
  };

  const handleQRScan = async (scannedText) => {
    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/events/${eventId}/check-out?qr_code_secret_out=${encodeURIComponent(
          scannedText
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await fetch("/api/points", {
        method: "POST",
        body: JSON.stringify({
          activityName: "attend_event",
          qr_code_text: scannedText,
          event_id: eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Check-out failed");
        setIsSuccess(false);
      } else {
        setIsSuccess(true);
        setError("");
      }
    } catch (err) {
      console.error("Check-out error:", err);
      setError(err.message || "Failed to process check-out");
      setIsSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="border-b ">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Camera className="w-6 h-6" />
            Check-out for event: {eventData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex justify-center">
            <Button
              onClick={toggleScanner}
              className={`flex items-center gap-2 ${
                scanning ? "bg-red-600 hover:bg-red-700" : ""
              }`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : scanning ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Start Scanning
                </>
              )}
            </Button>
          </div>

          {scanning && (
            <div className="relative w-full max-w-sm mx-auto rounded-lg overflow-hidden border">
              <div id="reader"></div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="animate-in fade-in">
              <AlertTitle>Oops</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className=" border-green-200 text-green-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Check-out processed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* {scannedText && (
          <div className="mt-4 animate-in fade-in">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Scanned Content
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg break-all border">
              {scannedText}
            </div>
          </div>
        )} */}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
