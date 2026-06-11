"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth?role=admin");
      } else if (profile && profile.role !== "admin") {
        if (profile.role === "collector") router.replace("/collector");
        else router.replace("/resident");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user || (profile && profile.role !== "admin")) return null;

  return <>{children}</>;
}
