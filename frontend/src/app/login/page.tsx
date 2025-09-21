// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";

export default function LoginPage() {
  type TokenDetails = {
  exp: number;
  type: string;
  [key: string]: unknown; // for any additional JWT fields
};  
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  type User = {
    id: string;
    phone: string;
    type: "user" | "admin";
    // Add other user fields if needed
  };
  const [pendingLogin, setPendingLogin] = useState<{ token: string; user: User } | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await api.post("/api/auth/login", { phone, password });

    const token = res.data?.access_token;
    if (!token || typeof token !== "string") {
      setError("Login failed: No token received.");
      return;
    }

    // Decode JWT first
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      setError("Login failed: Invalid token format.");
      return;
    }
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    setTokenDetails(JSON.parse(jsonPayload));
    // Map role to type for compatibility with AuthProvider
    const user: User = {
      id: res.data.user.id,
      phone: res.data.user.phone,
      type: res.data.user.role, // assumes backend returns 'role' as "user" or "admin"
    };
    setPendingLogin({ token, user });
    setShowModal(true);
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Invalid credentials");
    }
  }
};

const handleModalClose = () => {
  setShowModal(false);
  if (pendingLogin) {
    console.log("Logging in user:", pendingLogin.user);
    login(pendingLogin.token, pendingLogin.user);
    setPendingLogin(null);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h1>

        {error && (
          <p className="mb-4 text-red-500 font-semibold text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && tokenDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4 text-center text-green-600">
              Login Successful!
            </h2>
            <div className="mb-4">
              <p className="font-semibold">Access Token Details:</p>
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(tokenDetails, null, 2)}
              </pre>
            </div>
            <button
              onClick={handleModalClose}
              className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
