"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Truck,
  LifeBuoy,
  Star,
  Info,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import useAdminNotificationStore from "@/stores/adminNotificationStore";

const TYPE_CONFIG = {
  order: { icon: ShoppingBag, bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", label: "Order" },
  promotion: { icon: Tag, bg: "bg-[#FFF3E0]", text: "text-[#E65100]", label: "Promotion" },
  delivery: { icon: Truck, bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", label: "Delivery" },
  support: { icon: LifeBuoy, bg: "bg-[#FFEBEE]", text: "text-[#C62828]", label: "Support" },
  review: { icon: Star, bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", label: "Review" },
  system: { icon: Info, bg: "bg-[#F3E5F5]", text: "text-[#6A1B9A]", label: "System" },
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.system;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function NotificationRow({ notification, onClick }) {
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;
  return (
    <button
      onClick={() => onClick(notification)}
      className={`w-full text-left px-4 py-3.5 border-b border-border-light hover:bg-bg-secondary transition-colors group ${
        notification.isRead ? "" : "bg-primary-50/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
          <Icon size={15} className={cfg.text} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors ${
              notification.isRead ? "text-text-secondary" : "font-semibold text-text-primary"
            }`}>
              {notification.title}
            </p>
            {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
          </div>

          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{notification.message}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <TypeBadge type={notification.type} />
            <span className="text-[11px] text-text-tertiary">{timeAgo(notification.createdAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function NotificationDetailModal({ notification, onClose }) {
  if (!notification) return null;
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <Modal isOpen={!!notification} onClose={onClose} title="Notification" size="lg">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${cfg.bg}`}>
            <Icon size={18} className={cfg.text} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-text-primary leading-snug">{notification.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <TypeBadge type={notification.type} />
              {!notification.isRead && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary">
                  Unread
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Message</p>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">{notification.message}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>
            Received <strong className="text-text-primary">{timeAgo(notification.createdAt)}</strong>
            {" — "}
            {new Date(notification.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </span>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminNotificationsPage() {
  const {
    notifications, unreadCount, pagination, isLoading,
    fetchNotifications, markNotificationRead, markAllNotificationsRead,
  } = useAdminNotificationStore();

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    fetchNotifications(currentPage, activeTab);
  }, [currentPage, activeTab, fetchNotifications]);

  function changeTab(tab) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  async function handleRowClick(notification) {
    setSelectedNotif(notification);
    if (!notification.isRead) {
      await markNotificationRead(notification._id);
      // Item no longer belongs in the "unread" filter — refresh the list
      if (activeTab === "unread") {
        fetchNotifications(currentPage, activeTab);
      }
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    if (activeTab !== "all") fetchNotifications(currentPage, activeTab);
  }

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Bell size={22} className="text-[#FF5722]" />
            Notifications
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Updates, contact messages, and alerts sent to you as super admin.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors self-start"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        {/* Filter tabs */}
        <div className="px-4 md:px-5 py-3 border-b border-border-light flex items-center gap-1 bg-bg-secondary/60">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeTab(tab.key)}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-[#FF5722] shadow-sm border border-border-light"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-tertiary gap-3">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-tertiary gap-3">
              <BellOff size={36} strokeWidth={1.2} />
              <p className="text-sm font-medium">
                {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationRow key={n._id} notification={n} onClick={handleRowClick} />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-border-light">
            <p className="text-xs text-text-tertiary">
              Page {currentPage} of {totalPages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      <NotificationDetailModal notification={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
}
