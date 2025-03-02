"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, User, Settings, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export default function NavBar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/events", label: "Events" },
    { href: "/projects", label: "Projects" },
    { href: "/questions", label: "Discussion" },
    { href: "/more-tools", label: "More Tools" },
  ];

  const profileMenuItems = [
    { icon: <User className="w-4 h-4" />, label: "Profile", href: "/profile" },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        scrolled && "shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList className="flex flex-wrap space-x-2">
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ))}
                <ThemeToggle />
              </NavigationMenuList>
            </NavigationMenu>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name || "User avatar"}
                      />
                      <AvatarFallback>
                        {user.name?.[0] || <User className="h-6 w-6" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      {user.email && (
                        <p className="text-sm text-muted-foreground truncate max-w-48">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {profileMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="cursor-pointer flex items-center"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="cursor-pointer flex items-center"
                      >
                        <span className="ml-2">Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <LogoutButton />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={toggleMenu}
            size="icon"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && user && (
          <div className="md:hidden border-t py-4 max-h-screen overflow-y-auto">
            <div className="flex items-center space-x-4 px-2 py-3 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatar}
                  alt={user.name || "User avatar"}
                />
                <AvatarFallback>
                  {user.name?.[0] || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email || ""}
                </p>
              </div>
            </div>
            <div className="space-y-1 px-2 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
              <div className="border-t pt-4 mt-4 space-y-1">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={closeMenu}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={closeMenu}
                  >
                    <span className="ml-2">Admin</span>
                  </Link>
                )}
                <div className="px-3 pt-2">
                  <LogoutButton onClick={closeMenu} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
