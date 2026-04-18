import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (session.user.role !== "admin") {
    redirect("/library");
  }

  return <>{children}</>;
}
