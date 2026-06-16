"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  ShoppingBag,
  LogIn,
  MapPin,
  Tag,
  UserCheck,
  Mail,
  Phone,
  Home,
  Briefcase,
  Save,
  Loader2,
} from "lucide-react";
import { Modal, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import useAdminCustomerStore from "@/stores/adminCustomerStore";

const ACTIVITY_TIMELINE = [
  { icon: ShoppingBag, label: "Placed order",         time: "Today, 11:42 AM",       color: "text-primary",       bg: "bg-primary-50" },
  { icon: LogIn,       label: "Logged in",             time: "Today, 11:30 AM",       color: "text-text-tertiary", bg: "bg-bg-secondary" },
  { icon: MapPin,      label: "Added new address",     time: "Jun 3, 2026, 9:18 PM",  color: "text-text-tertiary", bg: "bg-bg-secondary" },
  { icon: Tag,         label: "Coupon applied",        time: "Jun 1, 2026, 1:05 PM",  color: "text-success",       bg: "bg-success-light" },
  { icon: UserCheck,   label: "Account created",       time: "—",                     color: "text-text-tertiary", bg: "bg-bg-secondary" },
];

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const orderStatusStyles = {
  delivered: { label: "Delivered", classes: "bg-success-light text-success-dark" },
  cancelled:  { label: "Cancelled", classes: "bg-error-light text-error-dark" },
};

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);

  const {
    currentCustomer,
    customerOrders,
    totalOrders,
    totalSpent,
    isLoading,
    isSaving,
    fetchCustomerDetail,
    blockCustomer,
  } = useAdminCustomerStore();

  const [modal, setModal]           = useState(false);
  const [note, setNote]             = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved]   = useState(false);

  useEffect(() => {
    try {
      fetchCustomerDetail(id);
    } catch (_) {}
  }, [id]);

  if (isLoading && !currentCustomer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && !currentCustomer) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-error-light flex items-center justify-center">
            <Ban size={28} className="text-error" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Customer Not Found</h2>
          <p className="text-sm text-text-secondary text-center max-w-sm">
            No customer with ID <code className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded text-xs">{id}</code> exists in the system.
          </p>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  const customer = currentCustomer;
  const action = customer?.status === "active" ? "block" : "unblock";

  async function handleToggle() {
    if (isSaving) return;
    try {
      await blockCustomer(customer._id);
      setModal(false);
    } catch (_) {}
  }

  function handleSaveNote() {
    if (savingNote) return;
    setSavingNote(true);
    setNoteSaved(false);
    setTimeout(() => {
      setSavingNote(false);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    }, 900);
  }

  // Derive wallet balance and avg order from store data
  const walletBalance = customer?.wallet?.balance ?? customer?.wallet ?? 0;
  const avgOrder      = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
  const addressList   = customer?.addresses ?? [];

  const statGridItems = [
    { label: "Total Orders",    value: totalOrders,               sub: "lifetime" },
    { label: "Total Spent",     value: formatPrice(totalSpent),   sub: "lifetime", big: true },
    { label: "Avg Order Value", value: formatPrice(avgOrder),     sub: "per order" },
    { label: "Wallet Balance",  value: formatPrice(walletBalance), sub: "credits available" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/customers"
            className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-border-light bg-white text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft size={17} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-text-primary truncate">{customer?.name}</h1>
              <Badge variant={customer?.status === "active" ? "success" : "error"} dot>
                {customer?.status === "active" ? "Active" : "Blocked"}
              </Badge>
            </div>
            <p className="text-sm text-text-tertiary mt-0.5">Customer ID: {customer?._id}</p>
          </div>
        </div>

        <button
          onClick={() => setModal(true)}
          className={`inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] text-white transition-colors cursor-pointer shrink-0 ${
            customer?.status === "active"
              ? "bg-error hover:bg-error-dark"
              : "bg-success hover:bg-success-dark"
          }`}
        >
          {customer?.status === "active" ? <Ban size={15} /> : <CheckCircle size={15} />}
          {customer?.status === "active" ? "Block Customer" : "Unblock Customer"}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wide mb-4">Profile</h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-xl font-extrabold text-white">{customer?.name ? getInitials(customer.name) : "—"}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-2.5">
                <div>
                  <p className="text-lg font-bold text-text-primary">{customer?.name}</p>
                  <p className="text-xs text-text-tertiary">{customer?.addresses?.[0]?.city ?? "—"}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <a
                    href={`mailto:${customer?.email}`}
                    className="flex items-center gap-2 text-primary hover:underline truncate"
                  >
                    <Mail size={14} className="shrink-0 text-text-tertiary" />
                    <span className="truncate">{customer?.email}</span>
                  </a>
                  <a
                    href={`tel:${customer?.phone}`}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
                  >
                    <Phone size={14} className="shrink-0 text-text-tertiary" />
                    {customer?.phone}
                  </a>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <UserCheck size={14} className="shrink-0 text-text-tertiary" />
                    Joined {formatDate(customer?.createdAt)}
                  </div>
                </div>
                {walletBalance > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary-50 text-primary px-2.5 py-1 rounded-[var(--radius-full)]">
                    Wallet: {formatPrice(walletBalance)} credits
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Order History card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary">Order History</h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all orders
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light bg-bg-secondary">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Order #</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Restaurant</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-text-tertiary uppercase tracking-wide">Total</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Status</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-tertiary">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((order) => {
                      const statusInfo = orderStatusStyles[order.status] || { label: order.status, classes: "bg-bg-secondary text-text-secondary" };
                      const orderTotal = order.pricing?.total ?? order.total ?? 0;
                      const restaurantName = typeof order.restaurant === "object" ? order.restaurant?.name : order.restaurant;
                      return (
                        <tr key={order._id ?? order.orderNumber} className="hover:bg-bg-hover transition-colors">
                          <td className="px-5 py-3 font-mono text-xs font-semibold text-text-primary">{order.orderNumber}</td>
                          <td className="px-5 py-3 text-text-secondary">{restaurantName}</td>
                          <td className="px-5 py-3 text-right font-bold text-text-primary">{formatPrice(orderTotal)}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.classes}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-text-tertiary">{formatDate(order.createdAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Addresses card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">
              Saved Addresses
              <span className="ml-2 text-xs font-semibold text-text-tertiary bg-bg-secondary px-2 py-0.5 rounded-full">{addressList.length}</span>
            </h2>
            {addressList.length === 0 ? (
              <p className="text-sm text-text-tertiary">No saved addresses.</p>
            ) : (
              <div className="space-y-3">
                {addressList.map((addr, i) => {
                  const label = addr.label ?? addr.type ?? (i === 0 ? "Home" : i === 1 ? "Work" : "Other");
                  const Icon = label === "Home" ? Home : label === "Work" ? Briefcase : MapPin;
                  const addressText = addr.address ?? addr.street ?? addr.fullAddress ?? JSON.stringify(addr);
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-[var(--radius-lg)] border border-border-light"
                    >
                      <div className="w-8 h-8 rounded-[var(--radius-md)] bg-bg-secondary flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-text-tertiary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary uppercase tracking-wide">{label}</p>
                        <p className="text-sm text-text-secondary mt-0.5">{addressText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — 1/3 */}
        <div className="space-y-5">
          {/* Stats card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-bold text-text-tertiary uppercase tracking-wide mb-4">Customer Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              {statGridItems.map((item) => (
                <div key={item.label} className="bg-bg-secondary rounded-[var(--radius-lg)] p-3">
                  <p className={`font-extrabold text-text-primary leading-tight ${item.big ? "text-xl" : "text-lg"}`}>
                    {item.value}
                  </p>
                  <p className="text-xs font-semibold text-text-primary mt-0.5">{item.label}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Activity Timeline</h2>
            <div className="space-y-0">
              {ACTIVITY_TIMELINE.map((event, idx) => {
                const Icon = event.icon;
                const isLast = idx === ACTIVITY_TIMELINE.length - 1;
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${event.bg}`}>
                        <Icon size={14} className={event.color} />
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 bg-border-light my-1" />
                      )}
                    </div>
                    <div className={`min-w-0 ${!isLast ? "pb-4" : ""}`}>
                      <p className="text-sm font-medium text-text-primary leading-snug">{event.label}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">{event.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Notes card */}
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-bold text-text-primary mb-3">Admin Notes</h2>
            <p className="text-xs text-text-tertiary mb-3">Internal notes — not visible to customer</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add internal note about this customer..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none transition-colors"
            />
            <button
              onClick={handleSaveNote}
              disabled={savingNote}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 h-9 text-sm font-semibold rounded-[var(--radius-md)] bg-primary text-white hover:bg-primary-dark disabled:opacity-60 transition-colors cursor-pointer"
            >
              {savingNote ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : noteSaved ? (
                <>
                  <CheckCircle size={14} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Block / Unblock confirm modal */}
      <Modal
        isOpen={modal}
        onClose={() => { if (!isSaving) setModal(false); }}
        title={action === "block" ? `Block ${customer?.name}?` : `Unblock ${customer?.name}?`}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setModal(false)}
              disabled={isSaving}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className={`h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] text-white transition-colors cursor-pointer disabled:opacity-60 ${
                action === "block"
                  ? "bg-error hover:bg-error-dark"
                  : "bg-success hover:bg-success-dark"
              }`}
            >
              {isSaving
                ? "Please wait..."
                : action === "block"
                ? "Yes, Block"
                : "Yes, Unblock"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {action === "block"
            ? `${customer?.name} won't be able to place orders on the platform. You can unblock them at any time.`
            : `${customer?.name} will regain full access to place orders on the platform.`}
        </p>
      </Modal>
    </div>
  );
}
