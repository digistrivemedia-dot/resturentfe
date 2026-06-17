"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/restaurant/Sidebar";
import TopBar from "@/components/restaurant/TopBar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import useUiStore from "@/stores/uiStore";

export default function RestaurantLayout({ children }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUiStore();

  if (pathname === "/restaurant/login") return <>{children}</>;

  return (
    <ProtectedRoute allowedRoles={["restaurant_owner"]}>
      <div className="min-h-screen bg-bg-secondary">
        <Sidebar />
        <div
          className="transition-all duration-[var(--transition-slow)]"
          style={{
            marginLeft: isSidebarCollapsed
              ? "var(--sidebar-collapsed-width)"
              : "var(--sidebar-width)",
          }}
        >
          <TopBar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
