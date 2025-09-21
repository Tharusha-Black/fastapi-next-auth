// src/app/admin/page.tsx
"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.type !== "admin") router.push("/dashboard");
  }, [user, router]);

  return user ? (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Restricted area for admin users only.</p>
    </div>
  ) : null;
}
