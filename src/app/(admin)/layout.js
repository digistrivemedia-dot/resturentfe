"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminTopBar from "@/components/admin/TopBar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import useUiStore from "@/stores/uiStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUiStore();

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <div className="min-h-screen bg-bg-secondary">
        <AdminSidebar />
        <div
          className={`transition-all duration-[var(--transition-slow)] ${
            isSidebarCollapsed
              ? "lg:ml-[var(--sidebar-collapsed-width)]"
              : "lg:ml-[var(--sidebar-width)]"
          }`}
        >
          <AdminTopBar />
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
