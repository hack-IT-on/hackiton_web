import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getCurrentUser } from "./lib/getCurrentUser";

// Protected routes
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/code-editor",
  "/questions",
  "/problems",
  "/algorithm-visualizer",
  "/time-complexity-calculator",
  "/projects",
  "/events",
  "/leaderboard",
  "/more-tools",
  "/my-purchases",
  "/resource-hub",
  "/user-profile",
  "/code-blocks",
  "/api-playground",
  "/admin",
];

// Admin-only routes
const adminRoutes = ["/admin"];

export async function middleware(request) {
  const token = request.cookies.get("auth_token")?.value;
  const path = request.nextUrl.pathname;
  const user = await getCurrentUser();

  // Check if route is protected
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verify token
      const decoded = await verifyToken(token);

      // Optional: Additional checks like user role or verification status
      if (!decoded) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (adminRoutes.some((route) => path.startsWith(route))) {
        // Assuming the decoded token or user object has a role field
        if (!user || user.role !== "admin") {
          // Redirect non-admin users to dashboard or show unauthorized page
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }

      // if (!user.github_username && !user.leetcode_username) {
      //   NextResponse.redirect("/dashboard");
      // }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // console.log(user.leetcode_username);

  return NextResponse.next();
}
