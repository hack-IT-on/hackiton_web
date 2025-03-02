"use client";
import React from "react";
import {
  Users,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Mail,
  ChevronRight,
  FileQuestion,
  Contact,
  Images,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const AdminDashboard = () => {
  const adminOptions = [
    {
      title: "Users Management",
      icon: <Users className="w-6 h-6" />,
      description: "Manage user accounts and permissions",
      color: "bg-blue-100 text-blue-600",
      link: "/admin/users",
    },
    {
      title: "Events",
      icon: <Calendar className="w-6 h-6" />,
      description: "Create and manage events",
      color: "bg-green-100 text-green-600",
      link: "/admin/events",
    },
    {
      title: "Questions",
      icon: <FileQuestion className="w-6 h-6" />,
      description: "Manage questions",
      color: "bg-purple-100 text-purple-600",
      link: "/admin/questions",
    },
    {
      title: "Event Certificates",
      icon: <FileText className="w-6 h-6" />,
      description: "Manage event certificates",
      color: "bg-orange-100 text-orange-600",
      link: "/admin/certificates",
    },
    {
      title: "Communications",
      icon: <Mail className="w-6 h-6" />,
      description: "Manage emails and notifications",
      color: "bg-pink-100 text-pink-600",
      link: "/admin/communications",
    },
    {
      title: "Students",
      icon: <Contact className="w-6 h-6" />,
      description: "Manage students",
      color: "bg-gray-100 text-gray-600",
      link: "/admin/students",
    },
    {
      title: "Gallery",
      icon: <Images className="w-6 h-6" />,
      description: "Manage gallery",
      color: "bg-red-100 text-red-600",
      link: "/admin/gallery",
    },
  ];

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold ">Admin Dashboard</h1>
          <p className=" mt-2">
            Manage your application settings and view system statistics
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminOptions.map((option) => (
            <Card
              key={option.title}
              className="group hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${option.color} group-hover:scale-110 transition-transform duration-200`}
                    >
                      {option.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold  ">
                        {option.title}
                      </h3>
                      <p className="text-sm ">{option.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {/* <div className="text-sm font-medium text-gray-600">
                    {option.count} items
                  </div> */}
                  <Link href={option.link}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    >
                      Manage
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default AdminDashboard;
