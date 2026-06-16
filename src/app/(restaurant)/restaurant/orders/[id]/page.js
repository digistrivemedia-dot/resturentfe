"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Phone,
  MapPin,
  MessageSquare,
  IndianRupee,
  CheckCircle2,
  Clock,
  Package,
  Bike,
  ShoppingBag,
  HelpCircle,
  ChevronDown,
  Loader2,
  Home,
  XCircle,
  AlertCircle,
  Tag,
} from "lucide-react";
import useRestaurantDashboardStore from "@/stores/restaurantDashboardStore";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function formatTime(isoString) {
  if (!isoString) return "–";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(isoString) {
  if (!isoString) return "–";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Get variant name — backend: { name, price }, mock: string
function getVariantName(variant) {
  if (!variant) return null;
  if (typeof variant === "string") return variant;
  return variant.name || null;
}

// Normalise addons — backend: [{ groupName, name, price }], mock: string[]
function getAddonNames(addons) {
  if (!addons || addons.length === 0) return [];
  return addons.map((a) => (typeof a === "string" ? a : a.name));
}

// ─────────────────────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    color: "text-primary",
    bg: "bg-primary-50",
    icon: ShoppingBag,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-info",
    bg: "bg-info-light",
    icon: CheckCircle2,
  },
  preparing: {
    label: "Preparing",
    color: "text-warning-dark",
    bg: "bg-warning-light",
    icon: Clock,
  },
  ready: {
    label: "Ready for Pickup",
    color: "text-success-dark",
    bg: "bg-success-light",
    icon: Package,
  },
  picked_up: {
    label: "Picked Up",
    color: "text-success-dark",
    bg: "bg-success-light",
    icon: Bike,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-primary",
    bg: "bg-primary-50",
    icon: Bike,
  },
  delivered: {
    label: "Delivered",
    color: "text-success-dark",
    bg: "bg-success-light",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-error",
    bg: "bg-error-light",
    icon: XCircle,
  },
};

const STATUS_FLOW = ["placed", "confirmed", "preparing", "ready", "picked_up", "out_for_delivery", "delivered"];

function getNextStatuses(current) {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return [];
  return STATUS_FLOW.slice(idx + 1, idx + 2);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-full)] ${cfg.color} ${cfg.bg}`}
    >
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-bg-primary rounded-[var(--radius-lg)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function BillRow({ label, value, bold = false, discount = false, muted = false }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span
        className={`text-sm ${muted ? "text-text-tertiary" : bold ? "font-semibold text-text-primary" : "text-text-secondary"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${discount ? "text-success-dark" : bold ? "font-bold text-text-primary" : "text-text-primary"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────
function Timeline({ statusHistory, currentStatus }) {
  // Build a list of completed steps from history
  const completedStatuses = statusHistory.map((e) => e.status);
  const allSteps = STATUS_FLOW.filter(
    (s) => completedStatuses.includes(s) || s === currentStatus
  );

  return (
    <div className="space-y-0">
      {allSteps.map((status, idx) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
        const historyEntry = statusHistory.find((e) => e.status === status);
        const isCurrent = status === currentStatus;
        const isLast = idx === allSteps.length - 1;
        const Icon = cfg.icon;

        return (
          <div key={status} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  isCurrent
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : "bg-bg-secondary text-text-tertiary border-border-light"
                }`}
              >
                <Icon size={15} />
              </div>
              {!isLast && (
                <div className="w-0.5 h-6 bg-border-light mt-1 mb-1" />
              )}
            </div>

            {/* Label + timestamp */}
            <div className="pb-4 pt-1">
              <p
                className={`text-sm font-medium ${
                  isCurrent ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {cfg.label}
                {isCurrent && (
                  <span className="ml-2 text-xs text-text-tertiary font-normal">
                    (current)
                  </span>
                )}
              </p>
              {historyEntry && (
                <p className="text-xs text-text-tertiary mt-0.5">
                  {formatDateTime(historyEntry.timestamp)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading state
// ─────────────────────────────────────────────────────────────────────────────
function OrderLoading() {
  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-text-secondary">Loading order…</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Not found state
// ─────────────────────────────────────────────────────────────────────────────
function OrderNotFound() {
  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-error" />
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-2">Order not found</h2>
        <p className="text-sm text-text-secondary mb-6">
          The order you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/restaurant/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Live Orders
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-text-primary text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] animate-fade-in">
      <CheckCircle2 size={16} className="text-success" />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function OrderDetailPage({ params }) {
  const { id } = use(params);

  const { currentOrder, isLoading, isUpdating, fetchOrderById, updateOrderStatus, acceptOrder, rejectOrder } =
    useRestaurantDashboardStore();

  const [selectedNextStatus, setSelectedNextStatus] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Fetch order on mount
  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  // Sync local currentStatus when order loads or changes
  useEffect(() => {
    if (currentOrder && currentOrder._id === id) {
      setCurrentStatus(currentOrder.status);
    }
  }, [currentOrder, id]);

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  if (isLoading || (!currentOrder && !isLoading)) {
    // Still waiting for first load
    if (isLoading) return <OrderLoading />;
    // Load finished but no order
    return <OrderNotFound />;
  }

  // Wrong order loaded (shouldn't happen, but guard)
  if (currentOrder._id !== id) return <OrderLoading />;

  const order = currentOrder;
  const nextStatuses = getNextStatuses(currentStatus);
  const pricing = order.pricing || {};

  async function handleStatusUpdate() {
    if (!selectedNextStatus) return;
    try {
      await updateOrderStatus(order._id, selectedNextStatus);
      setCurrentStatus(selectedNextStatus);
      setSelectedNextStatus("");
      showToast(`Status updated to ${STATUS_CONFIG[selectedNextStatus]?.label || selectedNextStatus}`);
    } catch (err) {
      showToast("Failed to update status. Please try again.");
    }
  }

  // Build updated history for display (optimistic if status changed locally)
  const displayHistory =
    currentStatus !== order.status
      ? [
          ...(order.statusHistory || []),
          { status: currentStatus, timestamp: new Date().toISOString() },
        ]
      : (order.statusHistory || []);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/restaurant/orders"
              className="p-2 rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors shadow-[var(--shadow-sm)]"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-text-tertiary mt-0.5">
                Placed {formatDateTime(order.createdAt || order.placedAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={currentStatus} />
            <button
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary border border-border-light rounded-[var(--radius-md)] bg-bg-primary hover:bg-bg-hover transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <Printer size={15} />
              Print
            </button>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── LEFT: main info (2/3 width on desktop) ───────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Customer card */}
            <SectionCard title="Customer">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-base font-semibold text-text-primary">
                    {order.customer?.name || "—"}
                  </p>
                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    <Phone size={14} />
                    {order.customer?.phone}
                    <span className="text-xs font-medium text-primary ml-1">Call</span>
                  </a>
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-1.5 text-sm text-text-secondary">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-text-tertiary" />
                      <div>
                        <p>{order.deliveryAddress.fullAddress}</p>
                        {order.deliveryAddress.landmark && (
                          <p className="text-xs text-text-tertiary">
                            {order.deliveryAddress.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-full)] ${
                      order.orderType === "delivery"
                        ? "bg-primary-50 text-primary"
                        : "bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {order.orderType === "delivery" ? (
                      <><Bike size={12} /> Delivery</>
                    ) : (
                      <><ShoppingBag size={12} /> Takeaway</>
                    )}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Items card */}
            <SectionCard title="Order Items">
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="font-semibold">{item.quantity}×</span>{" "}
                        {item.name}
                        {getVariantName(item.variant) && (
                          <span className="text-text-tertiary text-xs ml-1">
                            ({getVariantName(item.variant)})
                          </span>
                        )}
                      </p>
                      {/* Addons — handle both string[] and object[] */}
                      {item.addons && item.addons.length > 0 && (
                        <p className="text-xs text-text-tertiary mt-0.5 pl-4">
                          + {getAddonNames(item.addons).join(", ")}
                        </p>
                      )}
                    </div>
                    {(item.price || item.itemTotal) && (
                      <p className="text-sm font-medium text-text-primary whitespace-nowrap">
                        ₹{item.itemTotal || item.price}
                      </p>
                    )}
                  </div>
                ))}

                {order.specialInstructions && (
                  <div className="flex items-start gap-2 pt-2 border-t border-border-light">
                    <MessageSquare size={14} className="mt-0.5 text-text-tertiary shrink-0" />
                    <p className="text-xs text-text-secondary italic">
                      {order.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border-light">
                  <span className="text-sm font-medium text-text-secondary">Subtotal</span>
                  <span className="text-sm font-semibold text-text-primary">
                    ₹{pricing.subtotal || order.total}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* Bill breakdown card */}
            <SectionCard title="Bill Breakdown">
              <div className="space-y-0.5">
                <BillRow label="Subtotal" value={`₹${pricing.subtotal || 0}`} />
                {pricing.deliveryFee > 0 && (
                  <BillRow label="Delivery fee" value={`₹${pricing.deliveryFee}`} />
                )}
                {pricing.packagingCharge > 0 && (
                  <BillRow
                    label="Packaging charge"
                    value={`₹${pricing.packagingCharge}`}
                    muted
                  />
                )}
                {pricing.platformFee > 0 && (
                  <BillRow
                    label="Platform fee"
                    value={`₹${pricing.platformFee}`}
                    muted
                  />
                )}
                {pricing.taxAmount > 0 && (
                  <BillRow
                    label={`GST (${pricing.taxPercentage || 5}%)`}
                    value={`₹${pricing.taxAmount}`}
                    muted
                  />
                )}
                {pricing.tip > 0 && (
                  <BillRow label="Tip" value={`₹${pricing.tip}`} />
                )}
                {pricing.couponDiscount > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-success-dark flex items-center gap-1.5">
                      <Tag size={12} />
                      Coupon{pricing.couponCode ? ` (${pricing.couponCode})` : ""}
                    </span>
                    <span className="text-sm text-success-dark font-medium">
                      −₹{pricing.couponDiscount}
                    </span>
                  </div>
                )}
                <div className="pt-2 mt-1 border-t border-border-light">
                  <BillRow
                    label="Total"
                    value={`₹${pricing.total || order.total}`}
                    bold
                  />
                </div>
              </div>
            </SectionCard>

            {/* Timeline card */}
            <SectionCard title="Order Timeline">
              <Timeline
                statusHistory={displayHistory}
                currentStatus={currentStatus}
              />
            </SectionCard>
          </div>

          {/* ── RIGHT: sidebar (1/3 width on desktop) ───────────────────── */}
          <div className="space-y-4">

            {/* Status update card */}
            <SectionCard title="Update Status">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Current status</p>
                  <StatusBadge status={currentStatus} />
                </div>

                {nextStatuses.length > 0 ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1.5">
                        Move to
                      </label>
                      <div className="relative">
                        <select
                          value={selectedNextStatus}
                          onChange={(e) => setSelectedNextStatus(e.target.value)}
                          className="w-full appearance-none text-sm border border-border-default rounded-[var(--radius-md)] px-3 py-2 pr-8 text-text-primary bg-bg-primary focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="">Select next status…</option>
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_CONFIG[s]?.label || s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!selectedNextStatus || isUpdating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-[var(--radius-md)] cursor-pointer"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Updating…
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-text-tertiary">
                    No further status updates available.
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Payment card */}
            <SectionCard title="Payment">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Method</span>
                  <span className="text-sm font-semibold text-text-primary capitalize">
                    {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Status</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-[var(--radius-full)] ${
                      order.paymentStatus === "paid"
                        ? "bg-success-light text-success-dark"
                        : "bg-warning-light text-warning-dark"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Amount</span>
                  <span className="text-sm font-bold text-text-primary flex items-center gap-0.5">
                    <IndianRupee size={13} />
                    {pricing.total || order.total}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="pt-2 border-t border-border-light">
                    <p className="text-xs text-text-tertiary">Transaction ID</p>
                    <p className="text-xs font-mono text-text-secondary mt-0.5 break-all">
                      {order.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Quick actions card */}
            <SectionCard title="Quick Actions">
              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-primary bg-bg-secondary hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors cursor-pointer"
                >
                  <Printer size={16} className="text-text-tertiary" />
                  Print Order
                </button>
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-primary bg-bg-secondary hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors"
                >
                  <Phone size={16} className="text-text-tertiary" />
                  Call Customer
                </a>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-text-primary bg-bg-secondary hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors cursor-pointer"
                >
                  <HelpCircle size={16} className="text-text-tertiary" />
                  Contact Support
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}
