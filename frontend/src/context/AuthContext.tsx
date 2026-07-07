"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => void;
  updateUser: (name: string, company?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("groweasy_token");
    const cachedUser = localStorage.getItem("groweasy_user");
    if (token && cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        // ignore corrupted cache
      }
    }
    setLoading(false);
  }, []);

  function persist(token: string, user: User) {
    localStorage.setItem("groweasy_token", token);
    localStorage.setItem("groweasy_user", JSON.stringify(user));
    setUser(user);
  }

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    persist(res.token, res.user);
  }

  async function signup(name: string, email: string, password: string, company?: string) {
    const res = await api.signup({ name, email, password, company });
    persist(res.token, res.user);
  }

  function logout() {
    localStorage.removeItem("groweasy_token");
    localStorage.removeItem("groweasy_user");
    setUser(null);
    router.push("/login");
  }

  async function updateUser(name: string, company?: string) {
    const res = await api.updateProfile({ name, company });
    localStorage.setItem("groweasy_user", JSON.stringify(res.user));
    setUser(res.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
