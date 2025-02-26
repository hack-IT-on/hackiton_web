"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Webcam from "react-webcam";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Mail,
  Lock,
  IdCard,
  AlertCircle,
  CheckCircle2,
  Camera,
  RefreshCw,
  X,
  FileImage,
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    studentID: "",
    email: "",
    password: "",
    cpassword: "",
    faceImage: null,
    idCardImage: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [showWebcam, setShowWebcam] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Camera input refs
  const cameraInputRef = useRef(null);
  const idCardInputRef = useRef(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Check if device is mobile or desktop
    const checkMobile = () => {
      const userAgent =
        typeof window !== "undefined" ? navigator.userAgent : "";
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkMobile();

    // Add event listener for window resize to update mobile status
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (formData.password !== formData.cpassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!formData.faceImage) {
      setError("Face image capture is required");
      return false;
    }
    if (!formData.idCardImage) {
      setError("College ID card image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(
          "Registration successful! We've sent you a verification email. Please check your inbox to complete the process."
        );
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.log(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Open camera to capture photo based on device type
  const capturePhoto = () => {
    if (isMobile) {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } else {
      setShowWebcam(true);
    }
  };

  // Open camera/file picker for ID card
  const captureIdCard = () => {
    if (idCardInputRef.current) {
      idCardInputRef.current.click();
    }
  };

  // Handle image capture from the mobile camera
  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please capture an image");
      return;
    }

    // Process the captured image
    const reader = new FileReader();
    reader.onload = function (event) {
      setFormData((prev) => ({ ...prev, faceImage: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle ID card image capture
  const handleIdCardCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image of your college ID");
      return;
    }

    // Process the captured image
    const reader = new FileReader();
    reader.onload = function (event) {
      setFormData((prev) => ({ ...prev, idCardImage: event.target.result }));
    };
    reader.readAsDataURL(file);

    // Reset the file input value to allow re-selection of the same file
    e.target.value = null;
  };

  // Handle webcam capture for desktop
  const captureWebcamImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFormData((prev) => ({ ...prev, faceImage: imageSrc }));
      setShowWebcam(false);
    }
  };

  const retakePhoto = () => {
    setFormData((prev) => ({ ...prev, faceImage: null }));
  };

  const retakeIdCard = () => {
    // Reset the ID card image
    setFormData((prev) => ({ ...prev, idCardImage: null }));

    // Trigger the file picker dialog again
    setTimeout(() => {
      captureIdCard();
    }, 100);
  };

  // Cancel webcam capture
  const cancelWebcam = () => {
    setShowWebcam(false);
  };

  // Check if the device is iOS
  const isIOS = () => {
    if (typeof navigator !== "undefined") {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    return false;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <p className="text-center text-gray-500">
            Enter your information to create your account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentID">MAKAUT Roll Number</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="studentID"
                    name="studentID"
                    type="number"
                    placeholder="12345678"
                    value={formData.studentID}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="cpassword"
                    name="cpassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.cpassword}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Face Image Capture Section with updated title */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <Label htmlFor="faceImage" className="font-medium">
                  Face verification with college ID
                </Label>
              </div>
              <div className="border rounded-md p-3">
                {formData.faceImage ? (
                  <div className="space-y-3">
                    <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-video">
                      <img
                        src={formData.faceImage}
                        alt="Captured face"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={retakePhoto}
                      className="w-full flex items-center justify-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retake Photo
                    </Button>
                  </div>
                ) : showWebcam && !isMobile ? (
                  <div className="space-y-3">
                    <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-video">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          facingMode: "user",
                          width: 480,
                          height: 360,
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={captureWebcamImage}
                        className="flex-1 flex items-center justify-center"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Capture
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelWebcam}
                        className="flex items-center justify-center"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full flex items-center justify-center"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Face Photo
                  </Button>
                )}
                {/* Hidden camera input for native camera capture on mobile */}
                <input
                  type="file"
                  accept="image/*"
                  capture={isIOS() ? undefined : "user"}
                  ref={cameraInputRef}
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>
              {!formData.faceImage && !showWebcam && (
                <p className="text-xs text-gray-500 mt-1">
                  {isMobile
                    ? "Click the button to open your device camera and take a clear photo of your face."
                    : "Click the button to use your webcam and take a clear photo of your face."}
                </p>
              )}
            </div>

            {/* College ID Card Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileImage className="h-5 w-5 text-blue-600" />
                <Label htmlFor="idCardImage" className="font-medium">
                  Upload College ID Card
                </Label>
              </div>
              <div className="border rounded-md p-3">
                {formData.idCardImage ? (
                  <div className="space-y-3">
                    <div className="relative bg-gray-100 rounded-md overflow-hidden aspect-video">
                      <img
                        src={formData.idCardImage}
                        alt="College ID Card"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={retakeIdCard}
                      className="w-full flex items-center justify-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Upload Different ID
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={captureIdCard}
                    className="w-full flex items-center justify-center"
                  >
                    <FileImage className="mr-2 h-4 w-4" />
                    Upload College ID Card
                  </Button>
                )}
                {/* Hidden file input for ID card upload */}
                <input
                  type="file"
                  accept="image/*"
                  ref={idCardInputRef}
                  onChange={handleIdCardCapture}
                  className="hidden"
                />
              </div>
              {!formData.idCardImage && (
                <p className="text-xs text-gray-500 mt-1">
                  Please upload a clear photo of your college ID card for
                  verification purposes.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
