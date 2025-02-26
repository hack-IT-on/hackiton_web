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
import { useEffect, useState } from "react";

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
import UpdateUserPopup from "../UpdateUserPopup"; // Import the new component

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

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const itemsPerPage = 5;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // New state for update modal

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data);
    }
    fetchUser();
  }, []);

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getProcessedData = () => {
    let processedData = [...users];

    // Apply status filter
    if (statusFilter !== "all") {
      processedData = processedData.filter(
        (user) => user.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      processedData = processedData.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Apply search
    if (searchTerm) {
      processedData = processedData.filter((user) =>
        Object.values(user).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  };

  const getPaginatedData = () => {
    const processedData = getProcessedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(getProcessedData().length / itemsPerPage);
  const totalUsers = getProcessedData().length;
  const activeUsers = getProcessedData().filter(
    (user) => user.status === "Active"
  ).length;

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
            <p className="text-sm text-gray-500 mt-1">
              {totalUsers} total users
            </p>
          </div>
          {/* <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button> */}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select> */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {/* <SelectItem value="editor">Editor</SelectItem> */}
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => sortData("name")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Name <SortIcon columnKey="name" />
                  </TableHead>
                  <TableHead
                    onClick={() => sortData("email")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Email <SortIcon columnKey="email" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50">
                    MAKAUT Roll Number
                  </TableHead>
                  <TableHead
                    onClick={() => sortData("role")}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    Role <SortIcon columnKey="role" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50">
                    Approval Status <SortIcon />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50">
                    GitHub Username
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-50">
                    Leedcode Username
                  </TableHead>
                  <TableHead className="w-[60px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPaginatedData().map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.student_id}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                        {user.is_approved === 1
                          ? "Approved"
                          : user.is_approved === 0
                          ? "Pending"
                          : user.is_approved === 3
                          ? "Banned"
                          : "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell>{user?.github_username}</TableCell>
                    <TableCell>{user?.leetcode_username}</TableCell>
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
                              setIsUpdateModalOpen(true); // Open the new update modal
                            }}
                          >
                            Update User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(user.id)}
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
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
      {/* Add the new Update User Popup */}
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
