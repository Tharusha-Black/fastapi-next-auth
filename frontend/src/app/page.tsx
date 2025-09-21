// src/app/page.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">
        Welcome to FastAPI + Next.js Auth
      </h1>

      <p className="text-lg mb-8 text-center max-w-md">
        A demo project with JWT authentication, role-based access control, and Tailwind CSS.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {!user && (
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
        )}

        {user && (
          <>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Dashboard
            </Link>

            {user.type === "admin" && (
              <Link
                href="/admin"
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Admin Panel
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
