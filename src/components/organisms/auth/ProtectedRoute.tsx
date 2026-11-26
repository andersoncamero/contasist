import { useAuth } from "@/useCases/auth";
import { Navigate } from "react-router-dom";
import React, { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, hasCheckedSession, checkSession } = useAuth();

  useEffect(() => {
    if (!hasCheckedSession) {
      void checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  if (!hasCheckedSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
