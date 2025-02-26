import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ViewDetailsModal = ({ user, isOpen, onClose }) => {
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
        icon: <AlertCircle className="h-4 w-4 text-gray-600 mr-1" />,
      };
    }
  };

  const approval = getApprovalStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" /> User Details
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

        <div className="grid md:grid-cols-2 gap-8 py-4">
          {/* User Information Column */}
          <div className="space-y-5 bg-gray-50 p-5 rounded-lg shadow-sm">
            <div className="text-center mb-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-3">
                <span className="text-2xl font-semibold text-gray-700">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center mb-1">
                  <Shield className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-500">Role</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center mb-1">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-500">Status</p>
                </div>
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${approval.color}`}
                >
                  {approval.icon} {approval.label}
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center mb-1">
                <IdCard className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-500">
                  MAKAUT Roll Number
                </p>
              </div>
              <p className="font-medium">{user.student_id || "Not provided"}</p>
            </div>

            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center mb-1">
                <Github className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-500">GitHub</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">
                  {user.github_username || "Not provided"}
                </p>
                {hasGithub && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-0 h-auto"
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

            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="flex items-center mb-1">
                <Code className="h-4 w-4 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-500">LeetCode</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">
                  {user.leetcode_username || "Not provided"}
                </p>
                {hasLeetcode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-0 h-auto"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center mb-1">
                  <Trophy className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Total Points
                  </p>
                </div>
                {user.total_points}
              </div>

              <div className="bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center mb-1">
                  <Coins className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Total Coins
                  </p>
                </div>
                {user.code_coins}
              </div>
            </div>
          </div>

          {/* Images Column */}
          <div className="space-y-6">
            {/* Face Verification Image */}
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                  Face Verification
                </p>
                <Badge variant="outline" className="bg-blue-50">
                  Verification Image
                </Badge>
              </div>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <img
                  src={user.face_image_url}
                  alt="Face Verification"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Face+Image+Not+Available";
                    e.target.alt = "Face image not available";
                  }}
                />
              </div>
            </div>

            {/* ID Card Image */}
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">ID Card</p>
                <Badge variant="outline" className="bg-blue-50">
                  Identity Document
                </Badge>
              </div>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <img
                  src={user.id_card_image_url}
                  alt="ID Card"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=ID+Card+Not+Available";
                    e.target.alt = "ID card not available";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
