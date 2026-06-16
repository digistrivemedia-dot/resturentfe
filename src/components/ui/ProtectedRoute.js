"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { isAuthenticated, user, fetchMe } = useAuthStore();

  useEffect(() => {
    // If we have a token but no user data, fetch the user
    const token = useAuthStore.getState().token;
    if (token && !user) {
      fetchMe();
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      // Determine which login page to redirect to
      if (allowedRoles.includes("super_admin")) {
        router.push("/admin/login");
      } else if (allowedRoles.includes("restaurant_owner")) {
        router.push("/restaurant/login");
      } else {
        router.push("/login");
      }
      return;
    }

    // Check role if roles are specified
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect to correct portal based on actual role
      if (user.role === "super_admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "restaurant_owner") {
        router.push("/restaurant/dashboard");
      } else {
        router.push("/home");
      }
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  // Show loading while checking auth
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
