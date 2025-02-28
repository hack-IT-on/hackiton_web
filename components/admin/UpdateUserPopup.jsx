"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  School,
  Github,
  Code,
  Award,
  Coins,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const UpdateUserPopup = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    approved: 0,
    total_points: 0,
    code_coins: 0,
    student_id: "",
    github_username: "",
    leetcode_username: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        approved:
          user.is_approved !== undefined ? parseInt(user.is_approved) : 0,
        total_points: user.total_points || 0,
        code_coins: user.code_coins || 0,
        student_id: user.student_id || "",
        github_username: user.github_username || "",
        leetcode_username: user.leetcode_username || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (value) => {
    if (name === "approved") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
      toast.success("User updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const getApprovalBadge = (status) => {
    const statusMap = {
      0: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      1: { label: "Approved", color: "bg-green-100 text-green-800" },
      2: { label: "Banned", color: "bg-red-100 text-red-800" },
    };

    const { label, color } = statusMap[status] || statusMap[0];
    return <Badge className={`${color}`}>{label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Update User
          </DialogTitle>

          {/* Removed DialogDescription completely and replaced with a simple div */}
          {user?.name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Editing {user.name}</span>
              {formData.approved !== undefined &&
                getApprovalBadge(formData.approved)}
            </div>
          )}

          {/* <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button> */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      required
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="student_id"
                      className="flex items-center gap-2"
                    >
                      <School className="h-4 w-4" /> MAKAUT Roll Number
                    </Label>
                    <Input
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="12345678"
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Role
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={handleSelectChange("role")}
                      >
                        <SelectTrigger className="transition-all focus:ring-2 focus:ring-offset-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="approved"
                        className="flex items-center gap-2"
                      >
                        Approval Status
                      </Label>
                      <Select
                        value={formData.approved.toString()}
                        onValueChange={handleSelectChange("approved")}
                      >
                        <SelectTrigger className="transition-all focus:ring-2 focus:ring-offset-1">
                          <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Pending</SelectItem>
                          <SelectItem value="1">Approved</SelectItem>
                          <SelectItem value="2">Ban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="github_username"
                      className="flex items-center gap-2"
                    >
                      <Github className="h-4 w-4" /> GitHub Username
                    </Label>
                    <Input
                      id="github_username"
                      name="github_username"
                      value={formData.github_username}
                      onChange={handleChange}
                      placeholder="johndoe"
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                    {formData.github_username && (
                      <a
                        href={`https://github.com/${formData.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View GitHub Profile
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="leetcode_username"
                      className="flex items-center gap-2"
                    >
                      <Code className="h-4 w-4" /> LeetCode Username
                    </Label>
                    <Input
                      id="leetcode_username"
                      name="leetcode_username"
                      value={formData.leetcode_username}
                      onChange={handleChange}
                      placeholder="johndoe"
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                    {formData.leetcode_username && (
                      <a
                        href={`https://leetcode.com/${formData.leetcode_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View LeetCode Profile
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="total_points"
                      className="flex items-center gap-2"
                    >
                      <Award className="h-4 w-4" /> Total Points
                    </Label>
                    <Input
                      id="total_points"
                      name="total_points"
                      type="number"
                      value={formData.total_points}
                      onChange={handleChange}
                      placeholder="0"
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="code_coins"
                      className="flex items-center gap-2"
                    >
                      <Coins className="h-4 w-4" /> Code Coins
                    </Label>
                    <Input
                      id="code_coins"
                      name="code_coins"
                      type="number"
                      value={formData.code_coins}
                      onChange={handleChange}
                      placeholder="0"
                      className="transition-all focus:ring-2 focus:ring-offset-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="transition-all hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="transition-all hover:opacity-90"
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserPopup;
