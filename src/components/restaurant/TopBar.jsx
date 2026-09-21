"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, BellOff, Menu, LogOut, ChevronDown, Store, Settings, User } from "lucide-react";
import { Toggle } from "@/components/ui";
import useUiStore from "@/stores/uiStore";
import useAuthStore from "@/stores/authStore";
import useRestaurantProfileStore from "@/stores/restaurantProfileStore";
import useRestaurantNotificationStore from "@/stores/restaurantNotificationStore";
import { connectSocket } from "@/lib/socket";
import { timeAgo } from "@/lib/utils";

export default function TopBar() {
  const router = useRouter();
  const { toggleSidebar, isSidebarCollapsed } = useUiStore();
  const { user, logoutUser } = useAuthStore();
  const { restaurant } = useRestaurantProfileStore();
  const {
    notifications, unreadCount,
    fetchNotifications, markNotificationRead, markAllNotificationsRead,
  } = useRestaurantNotificationStore();

  const [isOpen, setIsOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Poll as a fallback, plus refetch instantly on any event that creates a
  // notification server-side (new order, support ticket, low rating).
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    const socket = connectSocket();
    const onEvent = () => fetchNotifications();
    socket.on("new_order", onEvent);
    socket.on("new_support_ticket", onEvent);
    socket.on("new_low_rating", onEvent);
    return () => {
      clearInterval(interval);
      socket.off("new_order", onEvent);
      socket.off("new_support_ticket", onEvent);
      socket.off("new_low_rating", onEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/restaurant/login");
  };

  return (
    <header
      className="sticky top-0 bg-bg-primary border-b border-border-light flex items-center gap-3 px-4 md:px-6"
      style={{ height: "var(--header-height)", zIndex: "var(--z-header)" }}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Restaurant name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 bg-primary-50 rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
          <Store size={16} className="text-primary" />
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">{restaurant?.name || "My Restaurant"}</p>
          <p className="text-[10px] text-text-tertiary leading-none">{restaurant?.address?.area || restaurant?.address?.city || ""}</p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Open / Close toggle */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-full)] border transition-colors ${
        isOpen ? "bg-success-light border-success/30" : "bg-error-light border-error/30"
      }`}>
        <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-success animate-pulse" : "bg-error"}`} />
        <span className={`text-xs font-bold hidden sm:block ${isOpen ? "text-success-dark" : "text-error"}`}>
          {isOpen ? "Open" : "Closed"}
        </span>
        <Toggle checked={isOpen} onChange={setIsOpen} size="sm" />
      </div>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          className="relative p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-xl)] overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
              <p className="text-sm font-bold text-text-primary">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllNotificationsRead} className="text-xs text-primary font-semibold hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-border-light max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-text-tertiary gap-2">
                  <BellOff size={28} strokeWidth={1.5} />
                  <p className="text-xs font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 flex items-start gap-3 hover:bg-bg-hover transition-colors cursor-pointer ${n.isRead ? "" : "bg-primary-50/40"}`}
                    onClick={() => !n.isRead && markNotificationRead(n._id)}
                  >
                    {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                    <div className={`flex-1 min-w-0 ${n.isRead ? "pl-4" : ""}`}>
                      <p className={`text-sm ${n.isRead ? "text-text-secondary" : "font-semibold text-text-primary"}`}>{n.title}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-border-light">
              <Link href="/restaurant/notifications" className="text-xs text-primary font-semibold hover:underline" onClick={() => setNotifOpen(false)}>
                View all notifications
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Profile dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[var(--radius-full)] border border-border-light hover:bg-bg-hover transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-extrabold">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-text-primary">{user?.name?.split(" ")[0] || "User"}</span>
          <ChevronDown size={14} className={`text-text-tertiary transition-transform ${profileOpen ? "rotate-180" : ""}`} />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-xl)] overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border-light">
              <p className="text-sm font-bold text-text-primary">{user?.name || "User"}</p>
              <p className="text-xs text-text-tertiary">{user?.email || ""}</p>
            </div>
            <div className="py-1">
              {[
                { href: "/restaurant/profile", label: "My Profile",  icon: User },
                { href: "/restaurant/settings", label: "Settings",   icon: Settings },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <Icon size={15} /> {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-light transition-colors"
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
