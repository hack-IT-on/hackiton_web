"use client";
import React from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditProfileModal from "../EditProfileModal";
import ViewDetailsModal from "../ViewDetailsModal";
import UpdateUserPopup from "../UpdateUserPopup";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const itemsPerPage = 5;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleDelete = async (userId, email, name) => {
    if (!confirm("Are you sure you want to reject this user?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/users/${userId}?email=${email}&name=${name}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Convert approval status code to string for filtering
  const getApprovalStatus = (code) => {
    if (code === 1) return "approved";
    if (code === 0) return "pending";
    if (code === 2) return "banned";
    return "unknown";
  };

  const getProcessedData = useCallback(() => {
    let processedData = [...users];

    // Apply status filter
    if (statusFilter !== "all") {
      processedData = processedData.filter(
        (user) => user.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      processedData = processedData.filter(
        (user) => user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Apply approval filter
    if (approvalFilter !== "all") {
      processedData = processedData.filter((user) => {
        const userApprovalStatus = getApprovalStatus(user.is_approved);
        return userApprovalStatus === approvalFilter.toLowerCase();
      });
    }

    // Apply search
    if (searchTerm) {
      processedData = processedData.filter((user) =>
        Object.values(user).some((value) =>
          value !== null && value !== undefined
            ? value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            : false
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [users, statusFilter, roleFilter, approvalFilter, searchTerm, sortConfig]);

  const getPaginatedData = useCallback(() => {
    const processedData = getProcessedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [getProcessedData, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(getProcessedData().length / itemsPerPage)
  );
  const totalUsers = getProcessedData().length;
  const activeUsers = getProcessedData().filter(
    (user) => user.status === "Active"
  ).length;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, approvalFilter, searchTerm]);

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline w-4 h-4 ml-1" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Users Management
            </CardTitle>
            <p className="text-sm  mt-1">{totalUsers} total users</p>
          </div>
          {/* <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 " />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Approval Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => sortData("name")}
                      className="cursor-pointer "
                    >
                      Name <SortIcon columnKey="name" />
                    </TableHead>
                    <TableHead
                      onClick={() => sortData("email")}
                      className="cursor-pointer  "
                    >
                      Email <SortIcon columnKey="email" />
                    </TableHead>
                    <TableHead className="cursor-pointer  ">
                      MAKAUT Roll Number
                    </TableHead>
                    <TableHead
                      onClick={() => sortData("role")}
                      className="cursor-pointer  "
                    >
                      Role <SortIcon columnKey="role" />
                    </TableHead>
                    <TableHead
                      onClick={() => sortData("is_approved")}
                      className="cursor-pointer  "
                    >
                      Approval Status <SortIcon columnKey="is_approved" />
                    </TableHead>
                    <TableHead className="cursor-pointer  ">
                      GitHub Username
                    </TableHead>
                    <TableHead className="cursor-pointer  ">
                      Leedcode Username
                    </TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedData().length > 0 ? (
                    getPaginatedData().map((user) => (
                      <TableRow key={user.id} className=" ">
                        <TableCell className="font-medium">
                          {user.name || "-"}
                        </TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>{user.student_id || "-"}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs ">
                            {user.role || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.is_approved === 1
                                ? "bg-green-100 text-green-800"
                                : user.is_approved === 0
                                ? "bg-yellow-100 text-yellow-800"
                                : user.is_approved === 2
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100"
                            }`}
                          >
                            {user.is_approved === 1
                              ? "Approved"
                              : user.is_approved === 0
                              ? "Pending"
                              : user.is_approved === 2
                              ? "Banned"
                              : "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>{user?.github_username || "-"}</TableCell>
                        <TableCell>{user?.leetcode_username || "-"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUpdateModalOpen(true);
                                }}
                              >
                                Update User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDelete(user.id, user.email, user.name)
                                }
                              >
                                Reject user
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        No users found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {getPaginatedData().length} of {totalUsers} users
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <ViewDetailsModal
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
      />
      <EditProfileModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdate={handleUserUpdate}
      />
      <UpdateUserPopup
        user={selectedUser}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdate={handleUserUpdate}
      />
    </Card>
  );
};

export default UsersPage;
