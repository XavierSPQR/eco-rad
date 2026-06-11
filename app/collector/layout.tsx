"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CollectorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth?role=collector");
      } else if (profile && profile.role !== "collector") {
        if (profile.role === "admin") router.replace("/admin/overview");
        else router.replace("/resident");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user || (profile && profile.role !== "collector")) return null;

  return <>{children}</>;
}
