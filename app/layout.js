import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Toaster } from "react-hot-toast";
import NavBarLogOut from "@/components/NavBarLogout";
import DashboardLayout from "./(dashboard)/dashboard/layout";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hack It On",
  description: "Hack It On",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  function getNavBar() {
    if (user) return <NavBar user={user} />;
    else return <NavBarLogOut />;
  }
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="_s0GyUxPTPMtAtVkTYKEKo41k1OpgFyW09JeR0BTV-k"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <NavBar user={user} /> */}
          {getNavBar()}
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
