import React from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useLocation } from "wouter";

interface ProtectedAdminRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedAdminRoute({ component: Component }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}
