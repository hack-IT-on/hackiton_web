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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import Link from "next/link";

const StudentsPage = () => {
  const [users, setUsers] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const itemsPerPage = 5;

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch("/api/admin/student-details");
      const data = await response.json();
      setUsers(data);
      console.log(users);
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
              Student Management
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {totalUsers} total students
            </p>
          </div>
          <Link href={"/admin/student-details"}>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Students
            </Button>
          </Link>
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => sortData("roll_no")}
                    className="cursor-pointer hover:bg-gray-500"
                  >
                    Roll No. <SortIcon columnKey="roll_no" />
                  </TableHead>
                  <TableHead
                    onClick={() => sortData("name")}
                    className="cursor-pointer hover:bg-gray-500"
                  >
                    Name <SortIcon columnKey="name" />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-500">
                    Semester
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-500">
                    Email
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-gray-500">
                    Course
                  </TableHead>
                  {/* <TableHead className="cursor-pointer hover:bg-gray-50">
                    Leedcode Username
                  </TableHead> */}
                  {/* <TableHead className="w-[60px]">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getPaginatedData().map((user) => (
                  <TableRow key={user.roll_no} className="hover:bg-gray-600">
                    <TableCell className="font-medium">
                      {user.roll_no}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.semester}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.course_name}</TableCell>
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
    </Card>
  );
};

export default StudentsPage;
