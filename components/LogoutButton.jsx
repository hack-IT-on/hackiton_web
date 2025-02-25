"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.clear();
        window.location.replace("/login");
      } else {
        setError("Logout failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </Button>
  );
}
