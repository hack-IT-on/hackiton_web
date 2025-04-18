"use client";
import { useState, useEffect, useRef } from "react";
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
  Info,
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
  const [retrievedEmail, setRetrievedEmail] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [studentVerified, setStudentVerified] = useState(false);
  const [verifyingStudent, setVerifyingStudent] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  function maskEmail(email) {
    if (!email) return null;

    const [username, domain] = email.split("@");

    let maskedUsername = "";
    if (username.length <= 3) {
      maskedUsername = username.charAt(0) + "*".repeat(username.length - 1);
    } else {
      maskedUsername =
        username.substring(0, 3) +
        "*".repeat(username.length - 3) +
        username.charAt(username.length - 1);
    }

    return `${maskedUsername}@${domain}`;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convert name to uppercase and email to lowercase
    if (name === "name") {
      processedValue = value.toUpperCase();
    } else if (name === "email") {
      processedValue = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    setError("");

    // Reset email verification if name or studentID changes
    if (name === "name" || name === "studentID") {
      setStudentVerified(false);
      setRetrievedEmail(null);
      setEmailVerified(false);
    }

    // Reset email verification if user changes the email after verification
    if (name === "email" && emailVerified) {
      setEmailVerified(false);
    }
  };

  const validateForm = () => {
    if (!studentVerified) {
      setError("Please verify your student information first");
      return false;
    }

    if (!emailVerified) {
      setError("Please use the email associated with your student account");
      return false;
    }

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

  const verifyStudentInfo = async () => {
    // Trim the name and studentID before validation
    const trimmedName = formData.name.trim();
    const trimmedStudentID = formData.studentID.trim();

    if (!trimmedName || !trimmedStudentID) {
      setError("Name and Roll Number are required");
      return;
    }

    try {
      setVerifyingStudent(true);
      setError("");

      // First update the formData with trimmed values
      setFormData((prev) => ({
        ...prev,
        name: trimmedName,
        studentID: trimmedStudentID,
      }));

      const response = await fetch("/api/verify-student", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          studentID: trimmedStudentID,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setStudentVerified(true);
        // Display masked email
        setRetrievedEmail(data.maskedEmail);
      } else {
        setError(data.message || "Student verification failed");
        setStudentVerified(false);
        setRetrievedEmail(null);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again");
      setStudentVerified(false);
    } finally {
      setVerifyingStudent(false);
    }
  };

  const verifyEmail = () => {
    if (!retrievedEmail || !formData.email) {
      setError("Please verify your student information first");
      return;
    }

    // Extract actual email from retrieved email for comparison
    const actualEmail = retrievedEmail.replace(/[*]/g, "");
    console.log(retrievedEmail);

    if (formData.email.toLowerCase() === actualEmail.toLowerCase()) {
      setEmailVerified(true);
      setError("");
    } else {
      setEmailVerified(false);
      setError("Email does not match with your student record");
    }
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
          "Registration successful! We've sent you a verification email. Please check your inbox and spam folder to complete the process."
        );
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.log(err);
      setError("Network error. Please try again:" + err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            <Alert className="mb-6  text-green-700 border-green-200">
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
                    disabled={studentVerified}
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
                    disabled={studentVerified}
                  />
                </div>
              </div>
            </div>

            {/* Student Verification Button */}
            {!studentVerified ? (
              <Button
                type="button"
                onClick={verifyStudentInfo}
                className="w-full"
                disabled={
                  verifyingStudent || !formData.name || !formData.studentID
                }
              >
                {verifyingStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying student information...
                  </>
                ) : (
                  "Verify Student Information"
                )}
              </Button>
            ) : (
              <Alert className=" text-blue-700 border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Student verification successful. Please use the email
                  associated with your account.
                </AlertDescription>
              </Alert>
            )}

            {/* Conditionally show email section after student verification */}
            {studentVerified && retrievedEmail && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Please enter your email address that matches with your
                    student record: <strong>{maskEmail(retrievedEmail)}</strong>
                  </p>
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
                      className={`pl-10 ${
                        emailVerified ? "border-green-500" : ""
                      }`}
                      disabled={emailVerified}
                    />
                  </div>
                </div>

                {!emailVerified && (
                  <Button
                    type="button"
                    onClick={verifyEmail}
                    className="w-full"
                    disabled={!formData.email}
                  >
                    Verify Email
                  </Button>
                )}

                {emailVerified && (
                  <Alert className=" text-green-700 border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Email verification successful!
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Show password fields only after email is verified */}
            {emailVerified && (
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
            )}

            {/* Show submit button only when all verifications are complete */}
            {emailVerified && (
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
            )}
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
