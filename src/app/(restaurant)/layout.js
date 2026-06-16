"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/restaurant/Sidebar";
import TopBar from "@/components/restaurant/TopBar";
import useUiStore from "@/stores/uiStore";

export default function RestaurantLayout({ children }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUiStore();

  // Don't show sidebar/topbar on login page
  if (pathname === "/restaurant/login") {
    return <>{children}</>;
  }

  return (
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
  );
}
