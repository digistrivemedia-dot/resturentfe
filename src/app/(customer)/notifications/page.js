"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Bell, BellOff, Tag, ShoppingBag, Truck,
  Star, Gift, AlertCircle, CheckCheck, Trash2,
} from "lucide-react";
import useProfileStore from "@/stores/profileStore";

const TYPE_ICONS = {
  order: { icon: ShoppingBag, iconBg: "bg-primary-50", iconColor: "text-primary" },
  delivery: { icon: Truck, iconBg: "bg-primary-50", iconColor: "text-primary" },
  promotion: { icon: Tag, iconBg: "bg-success-light", iconColor: "text-success" },
  system: { icon: Bell, iconBg: "bg-warning-light", iconColor: "text-warning" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications, unreadCount,
    fetchNotifications, markNotificationRead, markAllNotificationsRead,
  } = useProfileStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => markAllNotificationsRead();
  const markRead = (id) => markNotificationRead(id);
  const deleteNotif = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    // No delete API for now — just mark as read
    markNotificationRead(id);
  };

  const today = notifications.filter((n) => isToday(n.createdAt));
  const earlier = notifications.filter((n) => !isToday(n.createdAt));

  return (
    <div className="py-4 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-text-tertiary">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
            <BellOff size={36} className="text-text-tertiary" />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-2">No notifications</h3>
          <p className="text-sm text-text-secondary max-w-xs">
            You're all caught up! Offers, order updates, and alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {today.length > 0 && (
            <NotifGroup
              title="Today"
              items={today}
              onRead={markRead}
              onDelete={deleteNotif}
            />
          )}
          {earlier.length > 0 && (
            <NotifGroup
              title="Earlier"
              items={earlier}
              onRead={markRead}
              onDelete={deleteNotif}
            />
          )}
        </div>
      )}
    </div>
  );
}

function NotifGroup({ title, items, onRead, onDelete }) {
  return (
    <div>
      <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden divide-y divide-border-light">
        {items.map((n) => {
          const meta = TYPE_ICONS[n.type] || TYPE_ICONS.system;
          const Icon = meta.icon;
          const link = n.data?.orderId ? `/orders/${n.data.orderId}` : "#";
          return (
            <Link
              key={n._id}
              href={link}
              onClick={() => onRead(n._id)}
              className={`flex items-start gap-3 px-4 py-4 hover:bg-bg-hover transition-colors relative group ${n.isRead ? "" : "bg-primary-50/40"}`}
            >
              {/* Unread dot */}
              {!n.isRead && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                <Icon size={18} className={meta.iconColor} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-6">
                <p className={`text-sm ${n.isRead ? "font-medium text-text-primary" : "font-bold text-text-primary"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-text-tertiary mt-1.5">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => onDelete(n._id, e)}
                className="absolute right-3 top-3 p-1.5 rounded-full text-text-tertiary opacity-0 group-hover:opacity-100 hover:bg-error-light hover:text-error transition-all"
              >
                <Trash2 size={13} />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
