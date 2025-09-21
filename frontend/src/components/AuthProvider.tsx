// src/components/AuthProvider.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  type: "user" | "admin";
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

const login = (newToken: string, newUser: User, showModalCallback?: () => void) => {
  setToken(newToken);
  setUser(newUser);
  localStorage.setItem("token", newToken);
  localStorage.setItem("user", JSON.stringify(newUser));

  // Show modal first if callback provided
  if (showModalCallback) {
    showModalCallback();
    // Redirect after short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000); // 2 seconds
  } else {
    // Default behavior: immediate redirect
    router.push("/dashboard");
  }
};


  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
