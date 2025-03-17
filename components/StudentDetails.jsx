"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const StudentDetails = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    handleFiles(files[0]);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    handleFiles(selectedFile);
  };

  const handleFiles = (selectedFile) => {
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setStatus({ type: "", message: "" });
        // Simulate progress for better UX
        setProgress(20);
        setTimeout(() => setProgress(0), 500);
      } else {
        setStatus({
          type: "error",
          message: "Please upload only CSV or Excel files",
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setStatus({ type: "", message: "" });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      const response = await fetch("/api/admin/student-details", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (response.ok) {
        setProgress(100);
        setStatus({
          type: "success",
          message: `Successfully processed ${data.rowsInserted} new records${
            data.rowsUpdated
              ? ` and updated ${data.rowsUpdated} existing records`
              : ""
          }`,
        });
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      setProgress(0);
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6" />
          Upload Student Data
        </CardTitle>
        <CardDescription>
          Upload your student details in CSV or Excel format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div
            className="relative flex items-center justify-center w-full"
            onDragEnter={handleDrag}
          >
            <label
              className={`flex flex-col items-center justify-center w-full h-40 border-2 ${
                dragActive ? "border-primary" : "border-dashed"
              } rounded-lg cursor-pointer  transition-colors duration-200`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center px-4 py-6">
                <Upload
                  className={`w-10 h-10 mb-3 ${
                    dragActive ? "text-primary" : "text-gray-500"
                  }`}
                />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: CSV, XLS, XLSX. With column name:
                </p>
                {!file && (
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">ROLL NO</Badge>
                    <Badge variant="outline">STUDENTS NAME</Badge>
                    <Badge variant="outline">SEMESTER</Badge>
                    <Badge variant="outline">EMAIL</Badge>
                    <Badge variant="outline">COURSE NAME</Badge>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3  rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 text-center">
                Processing file... {progress}%
              </p>
            </div>
          )}

          {status.message && (
            <Alert
              variant={status.type === "error" ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {status.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? "Processing..." : "Upload Students Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetails;
