import React, { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role:
    | "super_admin"
    | "admin"
    | "manager"
    | "product_manager"
    | "order_manager"
    | "content_manager"
    | "marketing_manager";
  permissions: string[];
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  demoLogin: (role: AdminUser["role"]) => Promise<{ success: boolean }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ADMIN_KEY = "gb_admin_user";
const LOCAL_STORAGE_TOKEN_KEY = "gb_admin_token";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.auth.login.useMutation();
  const demoLoginMutation = trpc.admin.auth.demoLogin.useMutation();

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await loginMutation.mutateAsync({ email, password: pass });
      if (res.success && res.user) {
        setAdmin(res.user as AdminUser);
        setToken(res.token);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(res.user));
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.token);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, message: "Login failed" };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || "Invalid credentials" };
    }
  };

  const demoLogin = async (role: AdminUser["role"]) => {
    setIsLoading(true);
    try {
      const res = await demoLoginMutation.mutateAsync({ role });
      if (res.success && res.user) {
        setAdmin(res.user as AdminUser);
        setToken(res.token);
        localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, JSON.stringify(res.user));
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.token);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false };
    } catch (err) {
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    if (admin.role === "super_admin" || admin.permissions.includes("all")) return true;
    return admin.permissions.includes(permission);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(admin && token),
        isLoading,
        login,
        demoLogin,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
