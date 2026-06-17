"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import useAuthStore from "@/stores/authStore";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      if (allowedRoles.includes("super_admin")) router.replace("/admin/login");
      else if (allowedRoles.includes("restaurant_owner")) router.replace("/restaurant/login");
      else router.replace("/login");
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      if (user.role === "super_admin") router.replace("/admin/dashboard");
      else if (user.role === "restaurant_owner") router.replace("/restaurant/dashboard");
      else router.replace("/home");
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, router]);

  // Show spinner while AuthInitializer is running
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
