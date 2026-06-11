"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { UserRole } from "@/lib/auth";

export function useRoleGuard(allowedRole: UserRole) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/auth?role=${allowedRole}`);
      return;
    }

    if (!profile) {
      // If user is logged in but profile is missing, we might want to sign out or redirect to login with error
      // For now, redirect to login
      router.push("/auth");
      return;
    }

    if (profile.role !== allowedRole) {
      // Redirect to their correct dashboard
      if (profile.role === "admin") {
        router.push("/admin/overview");
      } else if (profile.role === "collector") {
        router.push("/collector");
      } else {
        router.push("/resident");
      }
      return;
    }

    if (!isAuthorized) {
      setIsAuthorized(true);
    }
  }, [user, profile, loading, router, allowedRole, isAuthorized]);

  return { isAuthorized, loading: loading || (!isAuthorized && !!user) };
}

export function RoleGuard({
  allowedRole,
  children
}: {
  allowedRole: UserRole;
  children: React.ReactNode
}) {
  const { isAuthorized, loading } = useRoleGuard(allowedRole);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
