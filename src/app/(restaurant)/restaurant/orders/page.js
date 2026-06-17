"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Circle,
  RefreshCw,
  Clock,
  CheckCircle2,
  ChevronRight,
  Phone,
  IndianRupee,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import useRestaurantDashboardStore from "@/stores/restaurantDashboardStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function minsAgo(isoString) {
  if (!isoString) return "–";
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diff < 1) return "just now";
  return `${diff} min${diff !== 1 ? "s" : ""} ago`;
}

function minsSince(isoString) {
  if (!isoString) return 0;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
}

// Get placed timestamp from order — backend uses createdAt, fallback to placedAt
function getPlacedAt(order) {
  return order.createdAt || order.placedAt;
}

// Get accepted timestamp from statusHistory if not directly present
function getAcceptedAt(order) {
  if (order.acceptedAt) return order.acceptedAt;
  const entry = (order.statusHistory || []).find((e) => e.status === "confirmed" || e.status === "preparing");
  return entry ? entry.timestamp : null;
}

// Get ready timestamp from statusHistory if not directly present
function getReadyAt(order) {
  if (order.readyAt) return order.readyAt;
  const entry = (order.statusHistory || []).find((e) => e.status === "ready");
  return entry ? entry.timestamp : null;
}

// Get order total — backend nests in pricing.total
function getTotal(order) {
  return order.pricing?.total ?? order.total ?? 0;
}

// Normalise addons — backend: [{ groupName, name, price }], mock: string[]
function getAddonNames(addons) {
  if (!addons || addons.length === 0) return [];
  return addons.map((a) => (typeof a === "string" ? a : a.name));
}

// Get variant name — backend: { name, price }, mock: string
function getVariantName(variant) {
  if (!variant) return null;
  if (typeof variant === "string") return variant;
  return variant.name || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function PaymentBadge({ method, status }) {
  if (method === "cod") {
    return (
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-[var(--radius-full)] bg-warning-light text-warning-dark"
      >
        COD · Pending
      </span>
    );
  }
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-[var(--radius-full)] bg-success-light text-success-dark"
    >
      Paid Online
    </span>
  );
}

// ── New-order card ─────────────────────────────────────────────────────────
function NewOrderCard({ order, onAccept, onReject }) {
  return (
    <div
      className="bg-bg-primary rounded-[var(--radius-lg)] border-l-4 border-l-error border border-border-light shadow-[var(--shadow-sm)] overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <Link
            href={`/restaurant/orders/${order._id}`}
            className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
          >
            #{order.orderNumber}
          </Link>
          <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {minsAgo(getPlacedAt(order))}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Phone size={11} />
          <span>{order.customer.name}</span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm text-text-primary">
              <span className="font-medium">{item.quantity}×</span> {item.name}
              {getVariantName(item.variant) && (
                <span className="text-text-tertiary text-xs"> ({getVariantName(item.variant)})</span>
              )}
            </p>
            {getAddonNames(item.addons).length > 0 && (
              <p className="text-xs text-text-tertiary pl-4">
                + {getAddonNames(item.addons).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-0.5">
            <IndianRupee size={13} />
            {getTotal(order)}
          </span>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </div>
        <Link
          href={`/restaurant/orders/${order._id}`}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
        >
          Details <ChevronRight size={12} />
        </Link>
      </div>

      {/* Action buttons */}
      <div className="flex gap-0 border-t border-border-light">
        <button
          onClick={() => onReject(order._id)}
          className="flex-1 py-2.5 text-sm font-medium text-error hover:bg-error-light transition-colors border-r border-border-light cursor-pointer"
        >
          Reject
        </button>
        <button
          onClick={() => onAccept(order._id)}
          className="flex-1 py-2.5 text-sm font-semibold text-success-dark bg-success-light hover:bg-success transition-colors hover:text-white cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

// ── Preparing card ─────────────────────────────────────────────────────────
function PreparingCard({ order, onMarkReady }) {
  const mins = minsSince(getAcceptedAt(order));
  return (
    <div
      className="bg-bg-primary rounded-[var(--radius-lg)] border-l-4 border-l-warning border border-border-light shadow-[var(--shadow-sm)] overflow-hidden"
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <Link
            href={`/restaurant/orders/${order._id}`}
            className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
          >
            #{order.orderNumber}
          </Link>
          <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            Placed {minsAgo(getPlacedAt(order))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-warning-dark bg-warning-light px-2 py-0.5 rounded-[var(--radius-full)]">
            {mins} min{mins !== 1 ? "s" : ""} in kitchen
          </p>
        </div>
      </div>

      <div className="px-4 pb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm text-text-primary">
              <span className="font-medium">{item.quantity}×</span> {item.name}
              {getVariantName(item.variant) && (
                <span className="text-text-tertiary text-xs"> ({getVariantName(item.variant)})</span>
              )}
            </p>
            {getAddonNames(item.addons).length > 0 && (
              <p className="text-xs text-text-tertiary pl-4">
                + {getAddonNames(item.addons).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-0.5">
            <IndianRupee size={13} />
            {getTotal(order)}
          </span>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </div>
        <Link
          href={`/restaurant/orders/${order._id}`}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
        >
          Details <ChevronRight size={12} />
        </Link>
      </div>

      <div className="border-t border-border-light">
        <button
          onClick={() => onMarkReady(order._id)}
          className="w-full py-2.5 text-sm font-semibold text-warning-dark bg-warning-light hover:bg-warning hover:text-white transition-colors cursor-pointer"
        >
          Mark Ready
        </button>
      </div>
    </div>
  );
}

// ── Picked-up card ────────────────────────────────────────────────────────
function PickedUpCard({ order, onMarkDelivered }) {
  const mins = minsSince(getReadyAt(order));
  return (
    <div className="bg-bg-primary rounded-[var(--radius-lg)] border-l-4 border-l-primary border border-border-light shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <Link href={`/restaurant/orders/${order._id}`} className="text-sm font-semibold text-text-primary hover:text-primary transition-colors">
            #{order.orderNumber}
          </Link>
          <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            Placed {minsAgo(getPlacedAt(order))}
          </p>
        </div>
        <p className="text-xs font-medium text-primary bg-primary-50 px-2 py-0.5 rounded-[var(--radius-full)]">
          Out for delivery
        </p>
      </div>
      <div className="px-4 pb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm text-text-primary">
              <span className="font-medium">{item.quantity}×</span> {item.name}
              {getVariantName(item.variant) && (
                <span className="text-text-tertiary text-xs"> ({getVariantName(item.variant)})</span>
              )}
            </p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-0.5">
            <IndianRupee size={13} />{getTotal(order)}
          </span>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </div>
        <Link href={`/restaurant/orders/${order._id}`} className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
          Details <ChevronRight size={12} />
        </Link>
      </div>
      <div className="border-t border-border-light">
        <button
          onClick={() => onMarkDelivered(order._id)}
          className="w-full py-2.5 text-sm font-semibold text-white bg-success hover:bg-success-dark transition-colors cursor-pointer"
        >
          Mark Delivered ✓
        </button>
      </div>
    </div>
  );
}

// ── Ready card ─────────────────────────────────────────────────────────────
function ReadyCard({ order, onMarkPickedUp }) {
  const mins = minsSince(getReadyAt(order));
  return (
    <div
      className="bg-bg-primary rounded-[var(--radius-lg)] border-l-4 border-l-success border border-border-light shadow-[var(--shadow-sm)] overflow-hidden"
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div>
          <Link
            href={`/restaurant/orders/${order._id}`}
            className="text-sm font-semibold text-text-primary hover:text-primary transition-colors"
          >
            #{order.orderNumber}
          </Link>
          <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            Placed {minsAgo(getPlacedAt(order))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-success-dark bg-success-light px-2 py-0.5 rounded-[var(--radius-full)]">
            Ready {mins} min{mins !== 1 ? "s" : ""} ago
          </p>
        </div>
      </div>

      <div className="px-4 pb-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm text-text-primary">
              <span className="font-medium">{item.quantity}×</span> {item.name}
              {getVariantName(item.variant) && (
                <span className="text-text-tertiary text-xs"> ({getVariantName(item.variant)})</span>
              )}
            </p>
            {getAddonNames(item.addons).length > 0 && (
              <p className="text-xs text-text-tertiary pl-4">
                + {getAddonNames(item.addons).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-0.5">
            <IndianRupee size={13} />
            {getTotal(order)}
          </span>
          <PaymentBadge method={order.paymentMethod} status={order.paymentStatus} />
        </div>
        <Link
          href={`/restaurant/orders/${order._id}`}
          className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
        >
          Details <ChevronRight size={12} />
        </Link>
      </div>

      <div className="border-t border-border-light">
        <button
          onClick={() => onMarkPickedUp(order._id)}
          className="w-full py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Mark Picked Up
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Column header
// ─────────────────────────────────────────────────────────────────────────────
function ColumnHeader({ title, count, accentClass }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <span
        className={`text-xs font-bold px-2 py-0.5 rounded-[var(--radius-full)] ${accentClass}`}
      >
        {count}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reject modal
// ─────────────────────────────────────────────────────────────────────────────
const REJECT_REASONS = ["Out of stock", "Too busy", "Other"];

function RejectModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState("");

  function handleConfirm() {
    onConfirm({ reason, note });
    setReason(REJECT_REASONS[0]);
    setNote("");
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Order"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-default rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-error hover:bg-error-dark rounded-[var(--radius-md)] transition-colors cursor-pointer"
          >
            Reject Order
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-text-primary mb-2">
            Reason for rejection
          </p>
          <div className="space-y-2">
            {REJECT_REASONS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="reject-reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-error w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-text-primary group-hover:text-text-primary">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Additional note{" "}
            <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. item will be available tomorrow"
            className="w-full text-sm border border-border-default rounded-[var(--radius-md)] px-3 py-2 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-text-primary text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] animate-fade-in"
    >
      <CheckCircle2 size={16} className="text-success" />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveOrdersPage() {
  const {
    liveOrders, isLoading, error,
    fetchLiveOrders, acceptOrder, rejectOrder, updateOrderStatus,
    addLiveOrder, updateLiveOrderFromSocket,
  } = useRestaurantDashboardStore();

  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [activeTab, setActiveTab] = useState("placed"); // mobile tabs
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [socketConnected, setSocketConnected] = useState(false);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchLiveOrders();

    const id = setInterval(() => {
      fetchLiveOrders();
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Socket.io — real-time order events
  useEffect(() => {
    const socket = connectSocket();

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("new_order", ({ order }) => {
      addLiveOrder(order);
      setActiveTab("placed");
      setToast({ visible: true, message: `New order #${order.orderNumber} received!` });
      setTimeout(() => setToast({ visible: false, message: "" }), 4000);
    });

    socket.on("order_updated", ({ order }) => {
      updateLiveOrderFromSocket(order);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_order");
      socket.off("order_updated");
      disconnectSocket();
    };
  }, []);

  // Derived columns
  const newOrders = liveOrders.filter((o) => o.status === "placed");
  const preparingOrders = liveOrders.filter((o) => o.status === "preparing" || o.status === "confirmed");
  const readyOrders = liveOrders.filter((o) => o.status === "ready");
  const pickedUpOrders = liveOrders.filter((o) => o.status === "picked_up" || o.status === "out_for_delivery");

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  async function handleAccept(id) {
    try {
      await acceptOrder(id);
      showToast("Order accepted — moved to Preparing");
    } catch (err) {
      showToast("Failed to accept order. Please try again.");
    }
  }

  function openRejectModal(id) {
    setRejectTargetId(id);
  }

  async function handleRejectConfirm({ reason, note }) {
    const id = rejectTargetId;
    setRejectTargetId(null);
    try {
      await rejectOrder(id, note ? `${reason}: ${note}` : reason);
      showToast("Order rejected");
    } catch (err) {
      showToast("Failed to reject order. Please try again.");
    }
  }

  async function handleMarkReady(id) {
    try {
      await updateOrderStatus(id, "ready");
      showToast("Order marked as ready for pickup");
    } catch (err) {
      showToast("Failed to update order. Please try again.");
    }
  }

  async function handleMarkPickedUp(id) {
    try {
      await updateOrderStatus(id, "picked_up");
      showToast("Order picked up — out for delivery!");
    } catch (err) {
      showToast("Failed to update order. Please try again.");
    }
  }

  async function handleMarkDelivered(id) {
    try {
      await updateOrderStatus(id, "delivered");
      showToast("Order delivered successfully!");
    } catch (err) {
      showToast("Failed to update order. Please try again.");
    }
  }

  // ── Column renderer (shared between desktop & mobile tabs) ─────────────────
  function renderNewOrders() {
    return (
      <div className="space-y-3">
        {newOrders.length === 0 ? (
          <EmptyColumn label="No new orders right now" />
        ) : (
          newOrders.map((o) => (
            <NewOrderCard
              key={o._id}
              order={o}
              onAccept={handleAccept}
              onReject={openRejectModal}
            />
          ))
        )}
      </div>
    );
  }

  function renderPreparingOrders() {
    return (
      <div className="space-y-3">
        {preparingOrders.length === 0 ? (
          <EmptyColumn label="No orders being prepared" />
        ) : (
          preparingOrders.map((o) => (
            <PreparingCard
              key={o._id}
              order={o}
              onMarkReady={handleMarkReady}
            />
          ))
        )}
      </div>
    );
  }

  function renderReadyOrders() {
    return (
      <div className="space-y-3">
        {readyOrders.length === 0 ? (
          <EmptyColumn label="No orders awaiting pickup" />
        ) : (
          readyOrders.map((o) => (
            <ReadyCard key={o._id} order={o} onMarkPickedUp={handleMarkPickedUp} />
          ))
        )}
      </div>
    );
  }

  function renderPickedUpOrders() {
    return (
      <div className="space-y-3">
        {pickedUpOrders.length === 0 ? (
          <EmptyColumn label="No orders out for delivery" />
        ) : (
          pickedUpOrders.map((o) => (
            <PickedUpCard key={o._id} order={o} onMarkDelivered={handleMarkDelivered} />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── API error banner ────────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-error-light text-error text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] border border-error/20">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          {/* Left: title + meta */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">Live Orders</h1>
              {/* Socket status dot */}
              <span className="relative flex h-2.5 w-2.5" title={socketConnected ? "Live — real-time updates on" : "Polling every 30s"}>
                {socketConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning" />
                )}
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1.5">
              <RefreshCw size={11} />
              {socketConnected
                ? "Real-time updates active"
                : `Polling every 30s · last at ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>

          {/* Right: count summary + history link */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { fetchLiveOrders(); setLastRefresh(new Date()); }}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Refresh now"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-error bg-error-light px-2.5 py-1 rounded-[var(--radius-full)]">
                {newOrders.length} New
              </span>
              <span className="font-medium text-warning-dark bg-warning-light px-2.5 py-1 rounded-[var(--radius-full)]">
                {preparingOrders.length} Preparing
              </span>
              <span className="font-medium text-success-dark bg-success-light px-2.5 py-1 rounded-[var(--radius-full)]">
                {readyOrders.length} Ready
              </span>
              <span className="font-medium text-primary bg-primary-50 px-2.5 py-1 rounded-[var(--radius-full)]">
                {pickedUpOrders.length} Picked Up
              </span>
            </div>
            <Link
              href="/restaurant/orders/history"
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
            >
              Order History <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── Desktop: 4-column kanban ─────────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-5">
          {/* Column 1 — New Orders */}
          <div>
            <ColumnHeader
              title="New Orders"
              count={newOrders.length}
              accentClass="bg-error-light text-error"
            />
            {renderNewOrders()}
          </div>

          {/* Column 2 — Preparing */}
          <div>
            <ColumnHeader
              title="Preparing"
              count={preparingOrders.length}
              accentClass="bg-warning-light text-warning-dark"
            />
            {renderPreparingOrders()}
          </div>

          {/* Column 3 — Ready for Pickup */}
          <div>
            <ColumnHeader
              title="Ready for Pickup"
              count={readyOrders.length}
              accentClass="bg-success-light text-success-dark"
            />
            {renderReadyOrders()}
          </div>

          {/* Column 4 — Picked Up */}
          <div>
            <ColumnHeader
              title="Picked Up"
              count={pickedUpOrders.length}
              accentClass="bg-primary-50 text-primary"
            />
            {renderPickedUpOrders()}
          </div>
        </div>

        {/* ── Mobile: tabs ─────────────────────────────────────────────────── */}
        <div className="lg:hidden">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-bg-primary rounded-[var(--radius-lg)] p-1 border border-border-light shadow-[var(--shadow-sm)] mb-4">
            {[
              { key: "placed", label: "New", count: newOrders.length, active: "bg-error-light text-error border-error/20" },
              { key: "preparing", label: "Preparing", count: preparingOrders.length, active: "bg-warning-light text-warning-dark border-warning/20" },
              { key: "ready", label: "Ready", count: readyOrders.length, active: "bg-success-light text-success-dark border-success/20" },
              { key: "picked_up", label: "Picked Up", count: pickedUpOrders.length, active: "bg-primary-50 text-primary border-primary/20" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-[var(--radius-md)] transition-all cursor-pointer border ${
                  activeTab === tab.key
                    ? tab.active
                    : "text-text-secondary border-transparent hover:bg-bg-hover"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    activeTab === tab.key ? "bg-white/60" : "bg-bg-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active tab content */}
          {activeTab === "placed" && renderNewOrders()}
          {activeTab === "preparing" && renderPreparingOrders()}
          {activeTab === "ready" && renderReadyOrders()}
          {activeTab === "picked_up" && renderPickedUpOrders()}
        </div>
      </div>

      {/* Reject modal */}
      <RejectModal
        isOpen={!!rejectTargetId}
        onClose={() => setRejectTargetId(null)}
        onConfirm={handleRejectConfirm}
      />

      {/* Toast */}
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty column placeholder
// ─────────────────────────────────────────────────────────────────────────────
function EmptyColumn({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border-light rounded-[var(--radius-lg)]">
      <CheckCircle2 size={28} className="text-text-tertiary mb-2" />
      <p className="text-sm text-text-tertiary">{label}</p>
    </div>
  );
}
