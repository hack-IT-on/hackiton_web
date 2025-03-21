import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  ExternalLink,
  User,
  Mail,
  Shield,
  IdCard,
  Github,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Coins,
  Trophy,
  Calendar,
  Smartphone,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ViewDetailsModal = ({ user, isOpen, onClose }) => {
  const [studentData, setStudentData] = useState({
    course_name: "",
    semester: "",
    mobile_number: "",
  });

  useEffect(() => {
    // Only fetch if the modal is open and we have a user
    if (isOpen && user) {
      async function fetchStudent() {
        try {
          const response = await fetch("/api/verify-student", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.name,
              studentID: user.student_id,
            }),
          });
          const data = await response.json();
          setStudentData(data);
        } catch (error) {
          console.error("Error fetching student data:", error);
          // Set default values in case of error
          setStudentData({
            course_name: "Computer Science & Engineering",
            semester: "3rd Year",
            mobile_number: "Not provided",
          });
        }
      }
      fetchStudent();
    }
  }, [isOpen, user]);

  if (!user) return null;

  const hasGithub = user.github_username && user.github_username.trim() !== "";
  const hasLeetcode =
    user.leetcode_username && user.leetcode_username.trim() !== "";

  const getApprovalStatus = () => {
    if (user.is_approved === 1) {
      return {
        label: "Approved",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4 text-green-600 mr-1" />,
      };
    } else if (user.is_approved === 0) {
      return {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />,
      };
    } else if (user.is_approved === 2) {
      return {
        label: "Banned",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-4 w-4 text-red-600 mr-1" />,
      };
    } else {
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertCircle className="h-4 w-4   mr-1" />,
      };
    }
  };

  const approval = getApprovalStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" /> User Profile
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <div className="py-4">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 p-4 bg-gradient-to-r  rounded-lg">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-2xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm  ">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                  <span className="px-1">•</span>
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${approval.color}`}
              >
                {approval.icon} {approval.label}
              </div>
            </div>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm" className="rounded-full">
                Message
              </Button> */}
              {/* {user.is_approved === 0 && (
                <Button variant="default" size="sm" className="rounded-full">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              )} */}
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {/* <TabsTrigger value="verification">Verification</TabsTrigger> */}
              <TabsTrigger value="activity">Activity & Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm   mb-1">MAKAUT Roll Number</p>
                      <div className="font-medium   p-2 rounded">
                        {user.student_id || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm   mb-1">Course</p>
                      <div className="font-medium   p-2 rounded">
                        {studentData.course_name ||
                          "Computer Science & Engineering"}
                      </div>
                    </div>
                    {/* <div>
                      <p className="text-sm   mb-1">
                        Year of Study
                      </p>
                      <div className="font-medium   p-2 rounded">
                        {studentData.semester || "3rd Year"}
                      </div>
                    </div> */}
                  </CardContent>
                </Card>

                {/* Coding Profiles */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <Code className="h-4 w-4 mr-2 text-blue-600" />
                      Coding Profiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm   mb-1">GitHub</p>
                      <div className="flex items-center justify-between font-medium   p-2 rounded">
                        <span>{user.github_username || "Not provided"}</span>
                        {hasGithub && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() =>
                              window.open(
                                `https://github.com/${user.github_username}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm   mb-1">LeetCode</p>
                      <div className="flex items-center justify-between font-medium   p-2 rounded">
                        <span>{user.leetcode_username || "Not provided"}</span>
                        {hasLeetcode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() =>
                              window.open(
                                `https://leetcode.com/${user.leetcode_username}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact & Additional Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm   mb-1">Email Address</p>
                      <div className="font-medium   p-2 rounded">
                        {user.email}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm   mb-1">Phone Number</p>
                      <div className="font-medium   p-2 rounded">
                        {studentData.mobile_number || "Not provided"}
                      </div>
                    </div>
                    {/* <div>
                      <p className="text-sm   mb-1">Location</p>
                      <div className="font-medium   p-2 rounded">
                        {user.location || "West Bengal, India"}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm   mb-1">Joined On</p>
                      <div className="font-medium   p-2 rounded">
                        {user.join_date || "January 15, 2023"}
                      </div>
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="verification" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md font-medium flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      Face Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                      <img
                        src={
                          user.face_image_url ||
                          "https://hack-it-on.s3.eu-north-1.amazonaws.com/defaults/Identity.jpg"
                        }
                        alt="Face Verification"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://hack-it-on.s3.eu-north-1.amazonaws.com/defaults/Identity.jpg";
                          e.target.alt = "Face image not available";
                        }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <Badge variant="outline" className=" bg-blue-500">
                        Verification Image
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-md font-medium flex items-center">
                      <IdCard className="h-4 w-4 mr-2 text-blue-600" />
                      ID Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                      <img
                        src={
                          user.id_card_image_url ||
                          "https://hack-it-on.s3.eu-north-1.amazonaws.com/defaults/Identity.jpg"
                        }
                        alt="ID Card"
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://hack-it-on.s3.eu-north-1.amazonaws.com/defaults/Identity.jpg";
                          e.target.alt = "ID card not available";
                        }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <Badge variant="outline" className=" bg-blue-500">
                        Identity Document
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent> */}

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-blue-600" />
                      Achievement Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="bg-indigo-100 p-4 rounded-full">
                        <Trophy className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="text-3xl font-bold">
                        {user.total_points || 0}
                      </div>
                      <div className="text-sm  ">Total Points Earned</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium flex items-center">
                      <Coins className="h-4 w-4 mr-2 text-blue-600" />
                      Coin Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="bg-yellow-100 p-4 rounded-full">
                        <Coins className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="text-3xl font-bold">
                        {user.code_coins || 0}
                      </div>
                      <div className="text-sm  ">Code Coins</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex gap-2 w-full justify-between">
            <div>
              {/* {user.is_approved === 0 && (
                <Button variant="destructive" size="sm">
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              )} */}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {/* {user.is_approved === 0 && (
                <Button variant="default">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve User
                </Button>
              )} */}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
