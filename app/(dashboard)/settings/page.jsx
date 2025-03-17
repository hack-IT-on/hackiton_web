"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCog,
  KeyRound,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  student_id: z
    .string()
    .min(5, "Student ID must be at least 5 characters")
    .max(20, "Student ID cannot exceed 20 characters"),
  github_username: z
    .string()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username too long"),
  leetcode_username: z
    .string()
    .min(1, "LeetCode username is required")
    .max(39, "LeetCode username too long"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

export default function SettingsPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    student_id: "",
    github_username: "",
    leetcode_username: "",
    email: "",
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      student_id: "",
      github_username: "",
      leetcode_username: "",
      email: "",
    },
  });

  const passwordForm = useForm({
    // resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setUserData(data);
        Object.keys(data).forEach((key) => {
          profileForm.setValue(key, data[key]);
        });
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }
    loadUserData();
  }, [profileForm]);

  async function onProfileSubmit(data) {
    // Preserve the original name and student_id
    const updatedData = {
      ...data,
      name: userData.name,
      student_id: userData.student_id,
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Profile updated successfully");
      setError("");
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  }

  async function onPasswordSubmit(data) {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Password updated successfully");
      setError("");
      passwordForm.reset();
    } catch (err) {
      setError(err.message);
      setStatus("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-12 h-12 " />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="border-b p-6">
          <div className="flex items-center space-x-4">
            <UserCog className="w-10 h-10 " />
            <div>
              <CardTitle className="text-2xl font-bold">
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and security settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="profile" className="">
                <UserCog className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="">
                <KeyRound className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-4"
                >
                  {/* Read-only fields */}
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Name <Lock className="ml-2 h-3 w-3 " />
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={userData.name}
                          readOnly
                          disabled
                          className="bg-gray-50 text-gray-600"
                        />
                      </FormControl>
                      <p className="text-xs ">Name cannot be changed</p>
                    </FormItem>

                    <FormItem>
                      <FormLabel className="flex items-center">
                        MAKAUT Roll Number{" "}
                        <Lock className="ml-2 h-3 w-3 text-gray-500" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={userData.student_id}
                          readOnly
                          disabled
                          className="bg-gray-50 text-gray-600"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Roll number cannot be changed
                      </p>
                    </FormItem>

                    <FormItem>
                      <FormLabel className="flex items-center">
                        Email <Lock className="ml-2 h-3 w-3 text-gray-500" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={userData.email}
                          readOnly
                          disabled
                          className="bg-gray-50 text-gray-600"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Email cannot be changed
                      </p>
                    </FormItem>
                  </div>

                  {/* Editable fields */}
                  {[
                    { name: "github_username", label: "GitHub Username" },
                    { name: "leetcode_username", label: "LeetCode Username" },
                  ].map(({ name, label, type }) => (
                    <FormField
                      key={name}
                      control={profileForm.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={type || "text"}
                              className="focus:ring-2 focus:ring-blue-300"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  ))}

                  <Button type="submit" className="w-full transition-colors">
                    Update Profile
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="password">
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="focus:ring-2 focus:ring-blue-300"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="focus:ring-2 focus:ring-blue-300"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full transition-colors">
                    Change Password
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          {status && (
            <Alert
              variant="default"
              className="mt-4 bg-green-50 border-green-200 text-green-800"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="mt-4 bg-red-50 border-red-200 text-red-800"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
