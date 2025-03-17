import React from "react";
import { getCurrentUser } from "@/lib/getCurrentUser";
import APIHome from "./_components/APIHome";
export default async function Home() {
  const user = await getCurrentUser();
  return <APIHome userId={user?.id} />;
}
