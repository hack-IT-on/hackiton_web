"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Calendar,
  FolderGit2,
  Code2,
  MessagesSquare,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/code-editor", label: "Online Compiler", icon: Code2 },
  { href: "/questions", label: "Discussion", icon: MessagesSquare },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="block">
                <Button
                  variant={pathname === link.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === link.href
                      ? "bg-secondary"
                      : "hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
