"use client";

import { Bell, Menu, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useUiStore from "@/stores/uiStore";

export default function AdminTopBar() {
  const router = useRouter();
  const { toggleSidebar } = useUiStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <header
      className="sticky top-0 bg-bg-primary border-b border-border-light flex items-center justify-between px-4 md:px-6"
      style={{
        height: "var(--header-height)",
        zIndex: "var(--z-header)",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">
          Super Admin
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover cursor-pointer">
          <User size={20} />
          <span className="text-sm font-semibold text-text-primary">
            {user?.name || "Admin User"}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover cursor-pointer"
          aria-label="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
