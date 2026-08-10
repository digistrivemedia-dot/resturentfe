"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight,
  MapPin, RefreshCw, Star, Search, SlidersHorizontal,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import RateOrderModal from "@/components/customer/RateOrderModal";

const STATUS_META = {
  pending_payment:  { label: "Payment Pending",     color: "text-warning",    bg: "bg-warning-light", dot: "bg-warning" },
  placed:           { label: "Order Placed",       color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  confirmed:        { label: "Confirmed",           color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  preparing:        { label: "Preparing",           color: "text-warning",    bg: "bg-warning-light", dot: "bg-warning" },
  ready:            { label: "Ready for Pickup",    color: "text-warning",    bg: "bg-warning-light", dot: "bg-warning" },
  picked_up:        { label: "Picked Up",           color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  out_for_delivery: { label: "Out for Delivery",    color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  delivered:        { label: "Delivered",           color: "text-success",    bg: "bg-success-light", dot: "bg-success" },
  cancelled:        { label: "Cancelled",           color: "text-error",      bg: "bg-error-light",   dot: "bg-error" },
};

// Anything not yet delivered or cancelled is a "live" order
const LIVE_STATUSES = new Set(["pending_payment", "placed", "confirmed", "preparing", "ready", "picked_up", "out_for_delivery"]);

function orderTypeLabel(type) {
  if (type === "dine_in") return "Dine-in";
  if (type === "pickup") return "Takeaway";
  if (type === "self_service") return "Self Service";
  return "Delivery";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.placed;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${m.bg} ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${LIVE_STATUSES.has(status) ? `${m.dot} animate-pulse` : m.dot}`} />
      {m.label}
    </span>
  );
}

function LiveOrderCard({ order }) {
  const lastStatus = order.statusHistory[order.statusHistory.length - 1];
  const itemNames = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  const isDelivery = order.orderType === "delivery";
  const isDineIn = order.orderType === "dine_in";
  const atRestaurant = !isDelivery;
  const trackHref = atRestaurant
    ? `/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}`
    : `/order/${order._id}/track`;
  const trackLabel = isDineIn ? "View Booking" : isDelivery ? "Track Order" : "View Order";

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border-2 border-primary/30 overflow-hidden shadow-[var(--shadow-sm)]">
      {/* Status bar */}
      <div className="bg-primary-50 px-4 py-2.5 flex items-center justify-between">
        <StatusBadge status={order.status} />
        <span className="text-xs text-text-tertiary">{formatTime(lastStatus.timestamp)}</span>
      </div>

      <div className="px-4 py-4">
        {/* Restaurant + order number */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-text-primary">{order.restaurant.name}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold text-primary mb-1">{orderTypeLabel(order.orderType)}</p>
            <p className="text-sm font-extrabold text-text-primary">₹{order.pricing.total}</p>
            <p className="text-xs text-text-tertiary">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Items */}
        <p className="text-xs text-text-secondary line-clamp-1 mb-4">{itemNames}</p>

        {/* Progress steps */}
        <OrderProgressBar status={order.status} atRestaurant={atRestaurant} />

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          <Link
            href={trackHref}
            className="flex-1 h-10 bg-primary text-white text-sm font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <MapPin size={15} /> {trackLabel}
          </Link>
          <Link
            href={`/orders/${order._id}`}
            className="h-10 px-4 border border-border-default text-sm font-semibold text-text-secondary rounded-[var(--radius-lg)] flex items-center gap-1.5 hover:bg-bg-hover transition-colors"
          >
            Details <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderProgressBar({ status, atRestaurant = false }) {
  const steps = atRestaurant ? ["placed", "confirmed", "preparing", "ready", "delivered"] : ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
  const currentIdx = steps.indexOf(
    atRestaurant ? status : (["ready", "picked_up"].includes(status) ? "out_for_delivery" : status)
  );

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const last = idx === steps.length - 1;
        const labels = atRestaurant ? ["Booked", "Confirmed", "Cooking", "Ready", "Done"] : ["Placed", "Confirmed", "Cooking", "On Way", "Done"];

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                done ? "bg-success border-success" : active ? "bg-white border-primary" : "bg-white border-border-light"
              }`}>
                {done ? (
                  <CheckCircle2 size={11} className="text-white" strokeWidth={3} />
                ) : active ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : null}
              </div>
              <span className={`text-[9px] mt-1 font-medium ${done || active ? "text-primary" : "text-text-tertiary"}`}>
                {labels[idx]}
              </span>
            </div>
            {!last && (
              <div className={`flex-1 h-0.5 mb-3.5 mx-0.5 transition-all ${done ? "bg-success" : active ? "bg-primary/30" : "bg-border-light"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeliveredOrderCard({ order, onRate }) {
  const itemNames = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  const isRated = order.rating?.itemRatings?.length > 0;
  const avgRating = isRated
    ? Math.round(order.rating.itemRatings.reduce((sum, r) => sum + r.rating, 0) / order.rating.itemRatings.length)
    : 0;

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
      <div className="px-4 py-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-bold text-text-primary">{order.restaurant.name}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{formatDate(order.createdAt)} · {order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-text-primary">₹{order.pricing.total}</p>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <p className="text-xs text-text-secondary line-clamp-1 mb-1">{itemNames}</p>

        {isRated && (
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={11} className={s <= avgRating ? "text-warning fill-warning" : "text-border-default"} />
            ))}
            <span className="text-xs text-text-tertiary ml-1">You rated this</span>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <Link
            href={`/restaurant/${order.restaurant.slug}`}
            className="flex-1 h-9 border-2 border-primary text-primary text-xs font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-1.5 hover:bg-primary-50 transition-colors"
          >
            <RefreshCw size={13} /> Reorder
          </Link>
          <Link
            href={`/orders/${order._id}`}
            className="h-9 px-3 border border-border-light text-xs font-semibold text-text-secondary rounded-[var(--radius-lg)] flex items-center gap-1 hover:bg-bg-hover transition-colors"
          >
            Details
          </Link>
          {!isRated && order.status === "delivered" && (
            <button
              onClick={() => onRate(order)}
              className="h-9 px-3 border border-warning/40 bg-warning-light text-warning text-xs font-bold rounded-[var(--radius-lg)] flex items-center gap-1.5 hover:bg-warning/20 transition-colors"
            >
              <Star size={12} /> Rate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState("live");
  const [search, setSearch] = useState("");
  const [rateOrderData, setRateOrderData] = useState(null);
  const { orders, isLoading, fetchMyOrders } = useOrderStore();

  useEffect(() => {
    // The backend defaults to 10 orders per page — fetch a much larger batch here
    // since this page needs the *complete* order history to split into live/delivered
    // (a capped fetch would silently drop older orders from both tabs).
    fetchMyOrders({ limit: 100 });
  }, []);

  const live = orders.filter((o) => LIVE_STATUSES.has(o.status));
  const delivered = orders.filter((o) => !LIVE_STATUSES.has(o.status));

  const filteredDelivered = delivered.filter((o) =>
    !search || o.restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="py-4 max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-extrabold text-text-primary">My Orders</h1>
          <button className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-bg-secondary rounded-[var(--radius-xl)] p-1 mb-5">
          {[
            { key: "live", label: "Live", count: live.length },
            { key: "delivered", label: "Delivered", count: delivered.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 text-sm font-semibold rounded-[var(--radius-lg)] transition-all ${
                tab === key
                  ? "bg-white text-text-primary shadow-[var(--shadow-sm)]"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                  tab === key ? "bg-primary text-white" : "bg-border-light text-text-tertiary"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Live tab */}
        {tab === "live" && (
          <div className="space-y-4">
            {live.length === 0 ? (
              <EmptyOrders
                icon={Clock}
                title="No live orders"
                desc="Your live orders will appear here. Order something delicious!"
              />
            ) : (
              live.map((o) => <LiveOrderCard key={o._id} order={o} />)
            )}
          </div>
        )}

        {/* Delivered tab */}
        {tab === "delivered" && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by restaurant or order ID…"
                className="w-full h-10 pl-9 pr-4 text-sm border border-border-light rounded-[var(--radius-full)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>

            {filteredDelivered.length === 0 ? (
              <EmptyOrders
                icon={ShoppingBag}
                title="No delivered orders"
                desc="Your completed and cancelled orders will appear here."
              />
            ) : (
              filteredDelivered.map((o) => (
                <DeliveredOrderCard key={o._id} order={o} onRate={setRateOrderData} />
              ))
            )}
          </div>
        )}
      </div>

      <RateOrderModal order={rateOrderData} isOpen={!!rateOrderData} onClose={() => setRateOrderData(null)} />
    </>
  );
}

function EmptyOrders({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
        <Icon size={36} className="text-text-tertiary" />
      </div>
      <h3 className="text-base font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-6">{desc}</p>
      <Link href="/home" className="h-10 px-6 bg-primary text-white text-sm font-semibold rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors">
        <ShoppingBag size={15} /> Order Now
      </Link>
    </div>
  );
}

