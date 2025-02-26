"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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
import toast from "react-hot-toast";

const UpdateUserPopup = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    approved: 0, // Initialize with integer
    total_points: 0,
    code_coins: 0,
    student_id: "",
    github_username: "",
    leetcode_username: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        approved:
          user.is_approved !== undefined ? parseInt(user.is_approved) : 0, // Ensure it's an integer
        total_points: user.total_points,
        code_coins: user.code_coins,
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
    // Convert to integer if it's the approved field
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
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
      toast.success("User updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Update User
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_id">MAKAUT Roll Number</Label>
            <Input
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              placeholder="12345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={handleSelectChange("role")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approved">Is Approved</Label>
            <Select
              value={formData.approved.toString()} // Convert to string for the Select component
              onValueChange={handleSelectChange("approved")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approval status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Approved</SelectItem>
                <SelectItem value="2">Ban</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_username">GitHub Username</Label>
            <Input
              id="github_username"
              name="github_username"
              value={formData.github_username}
              onChange={handleChange}
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcode_username">LeetCode Username</Label>
            <Input
              id="leetcode_username"
              name="leetcode_username"
              value={formData.leetcode_username}
              onChange={handleChange}
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcode_username">Total Points</Label>
            <Input
              id="total_points"
              name="total_points"
              value={formData.total_points}
              onChange={handleChange}
              placeholder="000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leetcode_username">Total Coins</Label>
            <Input
              id="code_coins"
              name="code_coins"
              value={formData.code_coins}
              onChange={handleChange}
              placeholder="000"
            />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateUserPopup;
