// src/app/dashboard/page.tsx
"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { FiCheckCircle, FiAlertCircle, FiRefreshCcw } from "react-icons/fi";

interface LogEntry {
  key: string;
  type: "info" | "success" | "error";
  message: string;
}

export default function DashboardPage() {
  const { user, token, login, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logId = useRef(0);

  const tokenRef = useRef<string | null>(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    logId.current += 1;
    const key = `${Date.now()}-${logId.current}`;
    setLogs((prev) => [
      ...prev,
      { key, type, message },
    ]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const fetchProtectedData = async (currentToken: string) => {

    addLog("Fetching protected resource...", "info");
    try {
      const res = await api.get("/api/protected/resource", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      addLog("Protected resource fetched successfully.", "success");
    } catch (err: any) {
      console.error("Error details:", err);


      // Check if it's a 401 error
      if (err.response?.status === 401) {
        console.log("⛔ Access token expired. Attempting to refresh...");
        addLog("⛔ Access token expired. Attempting to refresh...", "error");
        try {
          addLog("🔄 Calling refresh token API...", "info");
          const refreshRes = await api.post("/api/auth/refresh", {}, { withCredentials: true });
          const newToken = refreshRes.data.access_token;
          addLog(`✅ Access token refreshed: ${newToken.slice(0, 8)}...`, "success");

          // Update token in AuthProvider
          if (user) login(newToken, user);

          // Update our tokenRef immediately
          tokenRef.current = newToken;

          addLog("⏳ Waiting for next scheduled fetch with new token...", "info");
        } catch (refreshErr: any) {
          console.error("Refresh error:", refreshErr);
          addLog("❌ Refresh token failed. Session expired.", "error");
          logout();
        }
      } else {
        addLog("❌ Failed to fetch protected resource.", "error");
      }
    }
  };

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push("/login");
    } else {
      setChecking(false);

      // initial fetch
      if (tokenRef.current) fetchProtectedData(tokenRef.current);

      // poll every 10s
      const interval = setInterval(() => {
        if (tokenRef.current) fetchProtectedData(tokenRef.current);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user, router, login, logout]);

  if (checking) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.phone}</h1>
      <p className="mb-4">Your role: {user?.type}</p>

      <div className="bg-gray-100 p-4 rounded-lg max-h-[400px] overflow-y-auto">
        <h2 className="font-semibold mb-2">Live API Logs:</h2>
        <ul className="space-y-1">
          {logs.map((log) => (
            <li key={log.key} className="flex items-center gap-2">
              {log.type === "info" && <FiRefreshCcw className="text-blue-500" />}
              {log.type === "success" && <FiCheckCircle className="text-green-500" />}
              {log.type === "error" && <FiAlertCircle className="text-red-500" />}
              <span>{log.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white p-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}