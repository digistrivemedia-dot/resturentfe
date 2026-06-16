"use client";

import { useState, useMemo } from "react";
import {
  Bell,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  User,
  Store,
  Bike,
  ChevronRight,
  Loader2,
  Plus,
  BarChart2,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  Megaphone,
  ShieldAlert,
  Zap,
  Info,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import api from "@/lib/api";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const now = Date.now();
const mins = (n) => new Date(now - n * 60 * 1000).toISOString();
const hrs = (n) => new Date(now - n * 60 * 60 * 1000).toISOString();
const days = (n) => new Date(now - n * 24 * 60 * 60 * 1000).toISOString();
const future = (n) => new Date(now + n * 60 * 60 * 1000).toISOString();

const MOCK_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "Weekend Mega Sale — 40% Off!",
    message:
      "This weekend only! Get flat 40% off on orders above ₹299. Use code WEEKEND40 at checkout. Valid till Sunday midnight. Don't miss out!",
    type: "Promotional",
    targetAudience: "Customers only",
    sentAt: mins(18),
    recipientCount: 18420,
    openRate: 62,
    status: "sent",
    priority: "High",
  },
  {
    id: "notif-02",
    title: "Your order has been delivered",
    message:
      "Hi! Your order #ORD-20260606-047 from Pizza Paradise has been delivered. We hope you enjoy your meal. Rate your experience in the app.",
    type: "Transactional",
    targetAudience: "Customers only",
    sentAt: mins(34),
    recipientCount: 1,
    openRate: 100,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-03",
    title: "Platform Downtime Notice — 2 AM Tonight",
    message:
      "We will be performing scheduled maintenance tonight between 2:00 AM and 3:30 AM IST. Orders placed during this window may be delayed. We apologise for the inconvenience.",
    type: "System",
    targetAudience: "All Users",
    sentAt: hrs(2),
    recipientCount: 22860,
    openRate: 48,
    status: "sent",
    priority: "High",
  },
  {
    id: "notif-04",
    title: "New KYC Verification Required",
    message:
      "Your restaurant account requires an updated KYC submission before June 15. Please upload your FSSAI certificate and bank proof through the partner portal.",
    type: "Alert",
    targetAudience: "Restaurant owners",
    sentAt: hrs(5),
    recipientCount: 342,
    openRate: 71,
    status: "sent",
    priority: "High",
  },
  {
    id: "notif-05",
    title: "Earn More This Monsoon — Bonus Incentive",
    message:
      "Complete 20+ deliveries this week and earn an extra ₹500 bonus. Monsoon surge is here — more orders, more earnings! Log in to your partner app to track progress.",
    type: "Promotional",
    targetAudience: "Delivery partners",
    sentAt: hrs(8),
    recipientCount: 326,
    openRate: 55,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-06",
    title: "Flash Deal: Free Delivery Before 12 PM",
    message:
      "Breakfast just got better! Order anything before noon today and get free delivery — no minimum order. Grab your morning favourites now.",
    type: "Promotional",
    targetAudience: "Customers only",
    sentAt: hrs(20),
    recipientCount: 18420,
    openRate: 38,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-07",
    title: "Account Suspended — Policy Violation",
    message:
      "Your delivery partner account has been temporarily suspended due to multiple complaints about late deliveries. Please contact support at support@digistrive.in to resolve this.",
    type: "Alert",
    targetAudience: "Delivery partners",
    sentAt: days(1),
    recipientCount: 3,
    openRate: 100,
    status: "sent",
    priority: "High",
  },
  {
    id: "notif-08",
    title: "New Feature: Live Order Tracking",
    message:
      "We've launched real-time GPS tracking for all deliveries. Customers can now track their rider on a live map. Update your app to version 3.2 to enable this feature.",
    type: "System",
    targetAudience: "All Users",
    sentAt: days(2),
    recipientCount: 22860,
    openRate: 44,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-09",
    title: "Monthly Revenue Report Ready",
    message:
      "Your May 2026 earnings report is now available in the partner portal. You earned ₹48,200 last month. Tap to view a detailed breakdown including orders, ratings, and payouts.",
    type: "Transactional",
    targetAudience: "Restaurant owners",
    sentAt: days(3),
    recipientCount: 342,
    openRate: 83,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-10",
    title: "Dine More, Save More — Loyalty Points Campaign",
    message:
      "Earn 2x loyalty points on every order this week! Points can be redeemed for discounts on your next 3 orders. Log in now to check your current balance.",
    type: "Promotional",
    targetAudience: "Customers only",
    sentAt: days(4),
    recipientCount: 18420,
    openRate: 29,
    status: "sent",
    priority: "Normal",
  },
  {
    id: "notif-11",
    title: "Independence Day Sale — Scheduled",
    message:
      "Blast notification going out at 8 AM on August 15. Get flat ₹150 off sitewide with code INDEPENDENCE150. Applicable on all restaurants. Min order ₹499.",
    type: "Promotional",
    targetAudience: "Customers only",
    sentAt: future(36),
    recipientCount: 18420,
    openRate: 0,
    status: "scheduled",
    priority: "High",
  },
  {
    id: "notif-12",
    title: "Server Error — Notification Delivery Failed",
    message:
      "An attempt to send a bulk transactional notification to 1,200 customers failed due to a gateway timeout. Please retry from the notifications panel.",
    type: "System",
    targetAudience: "All Users",
    sentAt: days(2),
    recipientCount: 0,
    openRate: 0,
    status: "failed",
    priority: "High",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  Promotional: {
    icon: Megaphone,
    bg: "bg-[#FFF3E0]",
    text: "text-[#E65100]",
    dot: "bg-[#FF6D00]",
  },
  Transactional: {
    icon: Zap,
    bg: "bg-[#E8F5E9]",
    text: "text-[#2E7D32]",
    dot: "bg-[#43A047]",
  },
  Alert: {
    icon: AlertTriangle,
    bg: "bg-[#FFF8E1]",
    text: "text-[#F57F17]",
    dot: "bg-[#FFB300]",
  },
  System: {
    icon: ShieldAlert,
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
    dot: "bg-[#1E88E5]",
  },
};

const AUDIENCE_CONFIG = {
  "All Users": { icon: Users, label: "All Users" },
  "Customers only": { icon: User, label: "Customers" },
  "Restaurant owners": { icon: Store, label: "Restaurants" },
  "Delivery partners": { icon: Bike, label: "Delivery" },
  "Specific user": { icon: User, label: "Specific" },
};

const STATUS_CONFIG = {
  sent: {
    label: "Sent",
    icon: CheckCircle2,
    bg: "bg-[#E8F5E9]",
    text: "text-[#2E7D32]",
  },
  scheduled: {
    label: "Scheduled",
    icon: CalendarClock,
    bg: "bg-[#E3F2FD]",
    text: "text-[#1565C0]",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    bg: "bg-[#FFEBEE]",
    text: "text-[#C62828]",
  },
};

const FILTER_TABS = ["All", "Sent", "Scheduled", "Failed"];

const AUDIENCE_OPTIONS = [
  "All Users",
  "Customers only",
  "Restaurant owners",
  "Delivery partners",
  "Specific user",
];

const TYPE_OPTIONS = ["Promotional", "Transactional", "Alert", "System"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatStrip({ notifications }) {
  const thisMonth = notifications.filter(
    (n) =>
      n.status === "sent" &&
      new Date(n.sentAt) > new Date(now - 30 * 24 * 60 * 60 * 1000)
  );
  const totalSent = thisMonth.length;
  const avgOpenRate =
    thisMonth.length > 0
      ? Math.round(
          thisMonth.reduce((sum, n) => sum + n.openRate, 0) / thisMonth.length
        )
      : 0;
  const scheduled = notifications.filter((n) => n.status === "scheduled").length;
  const failed = notifications.filter((n) => n.status === "failed").length;

  const stats = [
    {
      label: "Total Sent (Month)",
      value: totalSent,
      icon: Send,
      bg: "bg-[#FFF3E0]",
      text: "text-[#E65100]",
      sub: `${notifications.filter((n) => n.status === "sent").length} all time`,
    },
    {
      label: "Avg Open Rate",
      value: `${avgOpenRate}%`,
      icon: TrendingUp,
      bg: "bg-[#E8F5E9]",
      text: "text-[#2E7D32]",
      sub: "across sent notifications",
    },
    {
      label: "Scheduled",
      value: scheduled,
      icon: CalendarClock,
      bg: "bg-[#E3F2FD]",
      text: "text-[#1565C0]",
      sub: "pending delivery",
    },
    {
      label: "Failed",
      value: failed,
      icon: XCircle,
      bg: "bg-[#FFEBEE]",
      text: "text-[#C62828]",
      sub: "need retry",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4"
          >
            <div
              className={`w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center ${stat.bg} mb-3`}
            >
              <Icon size={17} className={stat.text} />
            </div>
            <p className="text-2xl font-extrabold text-text-primary leading-none">
              {stat.value}
            </p>
            <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
            <p className="text-[11px] text-text-tertiary mt-0.5">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.System;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {type}
    </span>
  );
}

function AudiencePill({ audience }) {
  const cfg = AUDIENCE_CONFIG[audience] || AUDIENCE_CONFIG["All Users"];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-bg-secondary border border-border-light px-2 py-0.5 rounded-full">
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.sent;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function OpenRateBar({ rate }) {
  const color =
    rate >= 60
      ? "bg-[#43A047]"
      : rate >= 30
      ? "bg-[#FF6D00]"
      : "bg-[#E53935]";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-[11px] text-text-secondary font-medium tabular-nums w-7">
        {rate}%
      </span>
    </div>
  );
}

function NotificationRow({ notification, onClick }) {
  return (
    <button
      onClick={() => onClick(notification)}
      className="w-full text-left px-4 py-3.5 border-b border-border-light hover:bg-bg-secondary transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Type icon circle */}
        <div
          className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 mt-0.5 ${
            TYPE_CONFIG[notification.type]?.bg || "bg-bg-secondary"
          }`}
        >
          {(() => {
            const Icon =
              TYPE_CONFIG[notification.type]?.icon || Info;
            return (
              <Icon
                size={15}
                className={TYPE_CONFIG[notification.type]?.text || "text-text-secondary"}
              />
            );
          })()}
        </div>

        <div className="min-w-0 flex-1">
          {/* Row 1: Title + status */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {notification.title}
            </p>
            <StatusBadge status={notification.status} />
          </div>

          {/* Row 2: Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <TypeBadge type={notification.type} />
            <AudiencePill audience={notification.targetAudience} />
            {notification.priority === "High" && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#C62828] bg-[#FFEBEE] px-1.5 py-0.5 rounded-full">
                <AlertTriangle size={9} />
                High
              </span>
            )}
          </div>

          {/* Row 3: Stats */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {notification.status !== "scheduled" && (
              <>
                <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                  <Users size={10} />
                  {notification.recipientCount.toLocaleString("en-IN")} recipients
                </span>
                <OpenRateBar rate={notification.openRate} />
              </>
            )}
            <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
              <Clock size={10} />
              {notification.status === "scheduled"
                ? `Scheduled · ${new Date(notification.sentAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : timeAgo(notification.sentAt)}
            </span>
          </div>
        </div>

        <ChevronRight
          size={14}
          className="text-text-tertiary shrink-0 mt-1 group-hover:text-primary transition-colors"
        />
      </div>
    </button>
  );
}

function NotificationDetailModal({ notification, onClose }) {
  if (!notification) return null;
  const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.System;
  const TypeIcon = cfg.icon;

  return (
    <Modal
      isOpen={!!notification}
      onClose={onClose}
      title="Notification Details"
      size="lg"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${cfg.bg}`}
          >
            <TypeIcon size={18} className={cfg.text} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-text-primary leading-snug">
              {notification.title}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <TypeBadge type={notification.type} />
              <AudiencePill audience={notification.targetAudience} />
              <StatusBadge status={notification.status} />
              {notification.priority === "High" && (
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#C62828] bg-[#FFEBEE] px-1.5 py-0.5 rounded-full">
                  <AlertTriangle size={9} />
                  High Priority
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Message
          </p>
          <p className="text-sm text-text-primary leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Stats */}
        {notification.status !== "scheduled" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light p-3 text-center">
              <p className="text-lg font-extrabold text-text-primary">
                {notification.recipientCount.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">Recipients</p>
            </div>
            <div className="bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light p-3 text-center">
              <p className="text-lg font-extrabold text-text-primary">
                {notification.openRate}%
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">Open Rate</p>
            </div>
            <div className="bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light p-3 text-center">
              <p className="text-lg font-extrabold text-text-primary">
                {Math.round(
                  (notification.recipientCount * notification.openRate) / 100
                ).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">Opened</p>
            </div>
          </div>
        )}

        {/* Open rate bar (full width) */}
        {notification.status === "sent" && (
          <div>
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
              <span className="font-medium">Open rate</span>
              <span className="font-semibold">{notification.openRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  notification.openRate >= 60
                    ? "bg-[#43A047]"
                    : notification.openRate >= 30
                    ? "bg-[#FF6D00]"
                    : "bg-[#E53935]"
                }`}
                style={{ width: `${notification.openRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Clock size={13} />
          {notification.status === "scheduled" ? (
            <span>
              Scheduled for{" "}
              <strong className="text-text-primary">
                {new Date(notification.sentAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </strong>
            </span>
          ) : (
            <span>
              Sent <strong className="text-text-primary">{timeAgo(notification.sentAt)}</strong>{" "}
              &mdash;{" "}
              {new Date(notification.sentAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ComposePanel({ onSent }) {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "All Users",
    specificUserId: "",
    type: "Promotional",
    scheduleMode: "now",
    scheduledAt: "",
    priority: "Normal",
  });
  const [loading, setLoading] = useState(false);
  const [sentResult, setSentResult] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSentResult(null);
  }

  const recipientMap = {
    "All Users": 22860,
    "Customers only": 18420,
    "Restaurant owners": 342,
    "Delivery partners": 326,
    "Specific user": 1,
  };

  async function handleSend(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        target: form.targetAudience,
        userIds:
          form.targetAudience === "Specific user" && form.specificUserId.trim()
            ? [form.specificUserId.trim()]
            : [],
      };
      if (form.scheduleMode === "later" && form.scheduledAt) {
        payload.scheduledAt = form.scheduledAt;
      }
      const res = await api.post("/admin/notifications/send", payload);
      const count = res.data?.recipientCount ?? recipientMap[form.targetAudience] ?? 1;
      setSentResult({ count, title: form.title });
      setForm({
        title: "",
        message: "",
        targetAudience: "All Users",
        specificUserId: "",
        type: "Promotional",
        scheduleMode: "now",
        scheduledAt: "",
        priority: "Normal",
      });
      onSent && onSent();
    } catch (err) {
      console.error("Failed to send notification", err);
      setSentResult({ error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Title <span className="text-[#E53935]">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Flash Sale — 30% Off Today!"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
          required
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Message <span className="text-[#E53935]">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Write the notification body here..."
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors resize-none"
          required
        />
        <p className="text-[11px] text-text-tertiary mt-1 text-right">
          {form.message.length} / 300
        </p>
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Target Audience
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {AUDIENCE_OPTIONS.map((option) => {
            const cfg = AUDIENCE_CONFIG[option];
            const Icon = cfg.icon;
            return (
              <label
                key={option}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] border cursor-pointer transition-colors text-sm ${
                  form.targetAudience === option
                    ? "border-[#FF5722] bg-[#FFF3E0] text-[#E65100]"
                    : "border-border-light bg-bg-secondary text-text-secondary hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  value={option}
                  checked={form.targetAudience === option}
                  onChange={() => set("targetAudience", option)}
                  className="accent-[#FF5722]"
                />
                <Icon size={14} />
                <span className="font-medium">{option}</span>
                {form.targetAudience === option && (
                  <span className="ml-auto text-[11px] font-semibold text-[#E65100]">
                    ~{(recipientMap[option] ?? 1).toLocaleString("en-IN")} users
                  </span>
                )}
              </label>
            );
          })}
        </div>

        {form.targetAudience === "Specific user" && (
          <input
            type="text"
            placeholder="User ID (e.g. USR-00421)"
            value={form.specificUserId}
            onChange={(e) => set("specificUserId", e.target.value)}
            className="mt-2 w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
          />
        )}
      </div>

      {/* Type + Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Notification Type
          </label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors cursor-pointer"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Priority
          </label>
          <div className="flex rounded-[var(--radius-md)] border border-border-light overflow-hidden">
            {["Normal", "High"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("priority", p)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  form.priority === p
                    ? p === "High"
                      ? "bg-[#FFEBEE] text-[#C62828]"
                      : "bg-[#E8F5E9] text-[#2E7D32]"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
          Schedule
        </label>
        <div className="flex rounded-[var(--radius-md)] border border-border-light overflow-hidden mb-2">
          {[
            { value: "now", label: "Send Now", icon: Send },
            { value: "later", label: "Schedule for Later", icon: CalendarClock },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("scheduleMode", value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-colors ${
                form.scheduleMode === value
                  ? "bg-[#FFF3E0] text-[#E65100]"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {form.scheduleMode === "later" && (
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => set("scheduledAt", e.target.value)}
            min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
          />
        )}
      </div>

      {/* Send button */}
      <button
        type="submit"
        disabled={loading || !form.title.trim() || !form.message.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-lg)] bg-[#FF5722] text-white font-bold text-sm hover:bg-[#E64A19] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending…
          </>
        ) : form.scheduleMode === "later" ? (
          <>
            <CalendarClock size={16} />
            Schedule Notification
          </>
        ) : (
          <>
            <Send size={16} />
            Send Notification
          </>
        )}
      </button>

      {/* Success / error state */}
      {sentResult && !sentResult.error && (
        <div className="flex items-center gap-2.5 p-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-[var(--radius-lg)]">
          <CheckCircle2 size={18} className="text-[#2E7D32] shrink-0" />
          <p className="text-sm font-semibold text-[#1B5E20]">
            Sent to{" "}
            <strong>
              {sentResult.count.toLocaleString("en-IN")} recipients
            </strong>{" "}
            successfully!
          </p>
        </div>
      )}
      {sentResult?.error && (
        <div className="flex items-center gap-2.5 p-3 bg-[#FFEBEE] border border-[#EF9A9A] rounded-[var(--radius-lg)]">
          <AlertTriangle size={18} className="text-[#C62828] shrink-0" />
          <p className="text-sm font-semibold text-[#B71C1C]">
            Failed to send notification. Please try again.
          </p>
        </div>
      )}
    </form>
  );
}

// ─── Mobile Compose Modal ─────────────────────────────────────────────────────

function MobileComposeModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Notification" size="xl">
      <ComposePanel onSent={onClose} />
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [mobileComposeOpen, setMobileComposeOpen] = useState(false);

  const filtered = useMemo(() => {
    if (activeTab === "All") return MOCK_NOTIFICATIONS;
    return MOCK_NOTIFICATIONS.filter(
      (n) => n.status.toLowerCase() === activeTab.toLowerCase()
    );
  }, [activeTab]);

  const tabCounts = useMemo(() => {
    const counts = { All: MOCK_NOTIFICATIONS.length };
    ["Sent", "Scheduled", "Failed"].forEach((tab) => {
      counts[tab] = MOCK_NOTIFICATIONS.filter(
        (n) => n.status.toLowerCase() === tab.toLowerCase()
      ).length;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Bell size={22} className="text-[#FF5722]" />
            Notifications
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Compose and manage push notifications across all user segments.
          </p>
        </div>
        {/* Mobile compose button */}
        <button
          onClick={() => setMobileComposeOpen(true)}
          className="xl:hidden flex items-center gap-2 px-4 py-2.5 bg-[#FF5722] text-white rounded-[var(--radius-lg)] text-sm font-bold hover:bg-[#E64A19] transition-colors self-start"
        >
          <Plus size={16} />
          New Notification
        </button>
      </div>

      {/* Stats strip */}
      <StatStrip notifications={MOCK_NOTIFICATIONS} />

      {/* Two-column layout */}
      <div className="grid xl:grid-cols-[1fr_380px] gap-5 items-start">
        {/* ── Left: Notification History ── */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          {/* Section header */}
          <div className="px-4 md:px-5 py-4 border-b border-border-light flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BarChart2 size={16} className="text-[#FF5722]" />
                Notification History
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {MOCK_NOTIFICATIONS.length} notifications total
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-bg-secondary rounded-[var(--radius-lg)] p-1 border border-border-light">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-white text-[#FF5722] shadow-sm border border-border-light"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {tab}
                  {tabCounts[tab] > 0 && (
                    <span
                      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab
                          ? "bg-[#FFF3E0] text-[#E65100]"
                          : "bg-bg-primary text-text-tertiary"
                      }`}
                    >
                      {tabCounts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-tertiary gap-3">
                <Bell size={36} strokeWidth={1.2} />
                <p className="text-sm font-medium">No notifications in this category</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notification={notif}
                  onClick={setSelectedNotif}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Right: Compose Panel (desktop sticky) ── */}
        <aside className="hidden xl:block sticky top-6">
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Send size={15} className="text-[#FF5722]" />
                Send Notification
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Compose and dispatch to your audience
              </p>
            </div>
            <div className="px-5 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <ComposePanel />
            </div>
          </div>
        </aside>
      </div>

      {/* Detail modal */}
      <NotificationDetailModal
        notification={selectedNotif}
        onClose={() => setSelectedNotif(null)}
      />

      {/* Mobile compose modal */}
      <MobileComposeModal
        isOpen={mobileComposeOpen}
        onClose={() => setMobileComposeOpen(false)}
      />

      {/* Mobile floating button */}
      <button
        onClick={() => setMobileComposeOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#FF5722] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#E64A19] transition-colors z-40"
        aria-label="New Notification"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
