"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, MapPin, Clock, Phone, ChevronRight,
  Home, Package, Star, Share2, Download, AlertCircle, Loader2,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import { connectSocket } from "@/lib/socket";

const STATUS_STEPS = [
  { key: "placed",           label: "Order Placed" },
  { key: "confirmed",        label: "Restaurant Accepted" },
  { key: "preparing",        label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

function normalizeStatus(status) {
  if (["picked_up", "ready"].includes(status)) return "out_for_delivery";
  return status;
}

function getStepIndex(status) {
  return STATUS_ORDER.indexOf(normalizeStatus(status));
}

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber") || "ORD-000";
  const orderId = searchParams.get("orderId");

  const { currentOrder: order, isLoading, fetchOrderById } = useOrderStore();
  const [animStage, setAnimStage] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  // Fetch real order data
  useEffect(() => {
    if (orderId) fetchOrderById(orderId);
  }, [orderId, fetchOrderById]);

  // Connect socket and listen for real-time status updates
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const handler = ({ order: updatedOrder }) => {
      if (updatedOrder._id === orderId || updatedOrder._id?.toString() === orderId) {
        useOrderStore.setState({ currentOrder: updatedOrder });
      }
    };

    socket.on("order_status_updated", handler);
    return () => socket.off("order_status_updated", handler);
  }, [orderId]);

  // Calculate countdown from real order data
  useEffect(() => {
    if (!order) return;

    if (order.status === "delivered") {
      const placed = new Date(order.createdAt).getTime();
      const delivered = order.deliveryTracking?.deliveredAt
        ? new Date(order.deliveryTracking.deliveredAt).getTime()
        : Date.now();
      const mins = Math.round((delivered - placed) / 60000);
      setElapsedTime(mins);
      setCountdown(0);
      return;
    }

    const estimatedMins = order.estimatedDeliveryTime || 35;
    const placedAt = new Date(order.createdAt).getTime();
    const deliveryDeadline = placedAt + estimatedMins * 60 * 1000;
    const remaining = Math.max(0, Math.floor((deliveryDeadline - Date.now()) / 1000));
    setCountdown(remaining);
  }, [order?.status, order?.createdAt, order?.estimatedDeliveryTime]);

  // Live countdown tick — runs whenever countdown is set to a positive number
  useEffect(() => {
    if (!countdown) return;
    const iv = setInterval(() => setCountdown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(iv);
  }, [!!countdown]);

  // Entrance animations
  useEffect(() => {
    const t1 = setTimeout(() => setAnimStage(1), 100);
    const t2 = setTimeout(() => setAnimStage(2), 600);
    const t3 = setTimeout(() => setAnimStage(3), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (isLoading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  const mins = countdown !== null ? Math.floor(countdown / 60) : 0;
  const secs = countdown !== null ? countdown % 60 : 0;
  const estimatedMins = order.estimatedDeliveryTime || 35;
  const totalSecs = estimatedMins * 60;
  const progressPercent = countdown !== null && totalSecs > 0
    ? ((totalSecs - countdown) / totalSecs) * 100
    : 100;

  const etaTime = countdown
    ? new Date(Date.now() + countdown * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;

  return (
    <div className="py-6 max-w-lg mx-auto space-y-5">

      {/* Success Hero */}
      <div className={`text-center transition-all duration-700 ${animStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="relative w-28 h-28 mx-auto mb-5">
          <span className="absolute inset-0 rounded-full bg-success/10 animate-ping" />
          <span className="absolute inset-2 rounded-full bg-success/15" />
          <div className={`absolute inset-0 rounded-full flex items-center justify-center shadow-[0_0_32px_rgba(34,197,94,0.4)] ${isCancelled ? "bg-error" : "bg-success"}`}>
            {isCancelled
              ? <AlertCircle size={52} className="text-white" strokeWidth={2.5} />
              : <CheckCircle2 size={52} className="text-white" strokeWidth={2.5} />
            }
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-text-primary mb-1">
          {isCancelled ? "Order Cancelled" : isDelivered ? "Delivered!" : "Order Placed!"}
        </h1>
        <p className="text-text-secondary text-sm">
          {isCancelled
            ? `Reason: ${order.cancellation?.reason || "Cancelled"}`
            : isDelivered
            ? `Delivered in ${elapsedTime} min${elapsedTime !== 1 ? "s" : ""} 🎉`
            : "Your order has been received and will be prepared shortly"}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-bg-secondary px-4 py-2 rounded-[var(--radius-full)]">
          <Package size={14} className="text-primary" />
          <span className="text-sm font-bold text-text-primary">{order.orderNumber}</span>
        </div>
      </div>

      {/* ETA Card — hidden when delivered or cancelled */}
      {!isDelivered && !isCancelled && countdown !== null && (
        <div className={`bg-primary rounded-[var(--radius-xl)] px-5 py-5 text-white transition-all duration-700 delay-100 ${animStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70 font-medium">Estimated Delivery</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black tabular-nums">{String(mins).padStart(2, "0")}</span>
                <span className="text-2xl font-bold text-white/60">:</span>
                <span className="text-4xl font-black tabular-nums">{String(secs).padStart(2, "0")}</span>
              </div>
              <p className="text-xs text-white/60 mt-1">Minutes remaining</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">🛵</span>
              </div>
              {etaTime && (
                <>
                  <p className="text-xs text-white/70">Arriving by</p>
                  <p className="text-sm font-bold">{etaTime}</p>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Delivered summary card */}
      {isDelivered && elapsedTime !== null && (
        <div className={`bg-success rounded-[var(--radius-xl)] px-5 py-5 text-white transition-all duration-700 delay-100 ${animStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl">🎉</span>
            </div>
            <div>
              <p className="text-sm text-white/70">Order delivered in</p>
              <p className="text-3xl font-black">{elapsedTime} mins</p>
              <p className="text-xs text-white/70 mt-0.5">Hope you enjoy your meal!</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Status Steps */}
      <div className={`bg-white rounded-[var(--radius-xl)] border border-border-light px-5 py-5 transition-all duration-700 delay-200 ${animStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <h3 className="text-sm font-bold text-text-primary mb-4">Order Status</h3>
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border-light" />
          <div className="space-y-5">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentStepIdx || isDelivered;
              const active = idx === currentStepIdx && !isDelivered;
              const histEntry = order.statusHistory?.find((h) =>
                normalizeStatus(h.status) === step.key
              );
              return (
                <div key={step.key} className="flex items-center gap-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                    done ? "bg-success border-success" : active ? "bg-white border-primary animate-pulse" : "bg-white border-border-light"
                  }`}>
                    {done ? (
                      <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                    ) : active ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-border-default" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-sm font-medium ${done ? "text-success" : active ? "text-primary font-semibold" : "text-text-tertiary"}`}>
                      {step.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {histEntry && (
                        <span className="text-xs text-text-tertiary">
                          {new Date(histEntry.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </span>
                      )}
                      {active && (
                        <span className="text-[10px] bg-primary-50 text-primary font-bold px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-text-primary">Delivery Address</p>
            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
              {order.deliveryAddress?.fullAddress || "—"}
            </p>
            {order.deliveryAddress?.landmark && (
              <p className="text-xs text-text-tertiary mt-0.5">Near {order.deliveryAddress.landmark}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={orderId ? `/orders/${orderId}` : "/orders"}
          className="flex items-center justify-center gap-2 h-12 bg-primary text-white font-semibold text-sm rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors"
        >
          <Package size={16} /> Track Order
        </Link>
        <Link
          href="/home"
          className="flex items-center justify-center gap-2 h-12 bg-bg-secondary text-text-primary font-semibold text-sm rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors border border-border-light"
        >
          <Home size={16} /> Back to Home
        </Link>
      </div>

      {/* Rate & Share */}
      {isDelivered && (
        <div className="flex items-center gap-3">
          <Link
            href={`/orders/${orderId}`}
            className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors"
          >
            <Star size={15} className="text-warning" /> Rate Restaurant
          </Link>
          <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors">
            <Share2 size={15} /> Share Order
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 h-11 border border-border-light rounded-[var(--radius-xl)] text-sm font-medium text-text-secondary hover:bg-bg-hover hover:border-border-default transition-colors">
            <Download size={15} /> Invoice
          </button>
        </div>
      )}

      <p className="text-center text-xs text-text-tertiary pb-2">
        Need help?{" "}
        <Link href="/support" className="text-primary font-semibold hover:underline">
          Contact Support
        </Link>
      </p>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}
