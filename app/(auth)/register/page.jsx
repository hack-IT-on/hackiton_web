"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Mail,
  Lock,
  IdCard,
  Github,
  AlertCircle,
  CheckCircle2,
  Code,
  Phone,
} from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    studentID: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [tempRollNo, setTempRollNo] = useState("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [emailVerificationMessage, setEmailVerificationMessage] = useState("");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fetchingPhone, setFetchingPhone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // New effect to fetch phone number when name and studentID are entered
  // useEffect(() => {
  //   // Debounce the fetch to avoid too many requests
  //   const timer = setTimeout(() => {
  //     fetchPhoneNumber();
  //   }, 500);

  //   return () => clearTimeout(timer);
  // }, [formData.name, formData.studentID]);

  // Timer for OTP resend functionality
  useEffect(() => {
    let interval;
    if (otpDialogOpen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }

    return () => {
      clearInterval(interval);
    };
  }, [otpDialogOpen, resendTimer]);

  // Format the timer as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Format phone number for display (e.g., ***-***-1234)
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";
    // Show only last 4 digits, mask the rest
    return `***-***-${phone.slice(-4)}`;
  };

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
    return true;
  };

  const fetchPhoneNumber = async () => {
    // Check if both name and studentID have values and are not just whitespace
    if (formData.name.trim() && formData.studentID.trim()) {
      setFetchingPhone(true);
      try {
        const response = await fetch("/api/verify-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            studentID: formData.studentID,
          }),
        });

        const data = await response.json();
        if (data.mobile_number) {
          setPhoneNumber(data.mobile_number);
        } else {
          // Silent fail - we don't want to show errors during auto-fetch
          console.log("Could not fetch phone number automatically");
        }
      } catch (error) {
        console.error("Error fetching phone number:", error);
      } finally {
        setFetchingPhone(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    fetchPhoneNumber();

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
          "Registration successful! Now, verify your email ID. We've already sent you a verification email."
        );
        // Open OTP dialog after successful registration
        setOtpDialogOpen(true);
        // Reset the resend timer when the dialog opens
        setResendTimer(120);
        setCanResend(false);
        // The OTP is already sent by the backend during registration
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

  const verifyOtp = async () => {
    if (!otpValue) {
      setOtpError("Please enter the OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      // API call to verify OTP
      const response = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentID: formData.studentID,
          otp: otpValue,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSuccess("Phone verification successful!");
        // Show email verification message after OTP verification
        setEmailVerificationMessage(
          "Please check your email to complete verification."
        );

        // Close OTP dialog after a delay
        setTimeout(() => {
          setOtpDialogOpen(false);
        }, 3000);
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setOtpLoading(true);
      setOtpError("");
      // API call to resend OTP
      const response = await fetch("/api/register/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentID: formData.studentID,
          name: formData.name,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpValue("");
        setOtpError("");
        setOtpSuccess("OTP resent successfully!");
        // Reset the timer and disable resend button
        setResendTimer(120);
        setCanResend(false);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setOtpSuccess("");
        }, 3000);
      } else {
        setOtpError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setOtpError("Network error. Failed to resend OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {/* Phone OTP Verification Dialog */}
      <Dialog
        open={otpDialogOpen}
        onOpenChange={(open) => {
          // Prevent dialog from closing if verification is not complete
          if (!otpSuccess) return;
          setOtpDialogOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Phone Number</DialogTitle>
            <DialogDescription>
              {phoneNumber ? (
                <>
                  We've sent a 6-digit code to your registered mobile number{" "}
                  <span className="font-medium">
                    {formatPhoneForDisplay(phoneNumber)}
                  </span>
                  . Please enter it below to verify.
                </>
              ) : (
                <>
                  {fetchingPhone ? (
                    <>
                      <span className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retrieving your phone number...
                      </span>
                    </>
                  ) : (
                    "We've sent a 6-digit code to your college-registered mobile number. Please enter it below to verify."
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {otpError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{otpError}</AlertDescription>
              </Alert>
            )}

            {otpSuccess && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{otpSuccess}</AlertDescription>
              </Alert>
            )}

            {emailVerificationMessage && (
              <Alert className="bg-blue-50 text-blue-700 border-blue-200">
                <Mail className="h-4 w-4" />
                <AlertDescription>{emailVerificationMessage}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {canResend ? (
              <Button
                variant="outline"
                onClick={resendOtp}
                disabled={otpLoading}
                className="sm:order-1"
              >
                Resend OTP
              </Button>
            ) : (
              <div className="text-sm text-gray-500 sm:order-1 flex items-center justify-center sm:justify-start">
                Resend OTP in {formatTime(resendTimer)}
              </div>
            )}
            <Button
              onClick={verifyOtp}
              disabled={otpLoading || otpSuccess}
              className="sm:order-2"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
