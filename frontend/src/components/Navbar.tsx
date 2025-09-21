// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <div className="space-x-4">
        <Link href="/">Home</Link>
        {user && <Link href="/dashboard">Dashboard</Link>}
        {user?.type === "admin" && <Link href="/admin">Admin</Link>}
      </div>
      <div>
        {user ? (
          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded-lg"
          >
            Logout
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
