"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Menu, LogOut, User, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useUiStore from "@/stores/uiStore";
import useAdminNotificationStore from "@/stores/adminNotificationStore";
import { timeAgo } from "@/lib/utils";

export default function AdminTopBar() {
  const router = useRouter();
  const { toggleSidebar } = useUiStore();
  const { user, logoutUser } = useAuthStore();
  const {
    notifications, unreadCount,
    fetchNotifications, markNotificationRead, markAllNotificationsRead,
  } = useAdminNotificationStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover relative cursor-pointer"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-xl)] overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <p className="text-sm font-bold text-text-primary">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border-light max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-text-tertiary gap-2">
                    <BellOff size={28} strokeWidth={1.5} />
                    <p className="text-xs font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <button
                      key={n._id}
                      onClick={() => !n.isRead && markNotificationRead(n._id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-bg-hover transition-colors cursor-pointer ${n.isRead ? "" : "bg-primary-50/40"}`}
                    >
                      {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                      <div className={`flex-1 min-w-0 ${n.isRead ? "pl-4" : ""}`}>
                        <p className={`text-sm ${n.isRead ? "text-text-secondary" : "font-semibold text-text-primary"}`}>{n.title}</p>
                        <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-text-tertiary mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-border-light">
                <Link href="/admin/notifications" className="text-xs text-primary font-semibold hover:underline" onClick={() => setNotifOpen(false)}>
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
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
