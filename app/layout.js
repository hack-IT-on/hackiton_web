import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Toaster } from "react-hot-toast";
import NavBarLogOut from "@/components/NavBarLogout";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* <NavBar user={user} /> */}
        {getNavBar()}
        <Toaster />
        {children}
      </body>
    </html>
  );
}
