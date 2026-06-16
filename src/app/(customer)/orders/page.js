"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight,
  MapPin, RefreshCw, Star, Search, SlidersHorizontal,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";

const STATUS_META = {
  placed:           { label: "Order Placed",       color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  confirmed:        { label: "Confirmed",           color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  preparing:        { label: "Preparing",           color: "text-warning",    bg: "bg-warning-light", dot: "bg-warning" },
  ready:            { label: "Ready for Pickup",    color: "text-warning",    bg: "bg-warning-light", dot: "bg-warning" },
  picked_up:        { label: "Picked Up",           color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  out_for_delivery: { label: "Out for Delivery",    color: "text-primary",    bg: "bg-primary-50",    dot: "bg-primary" },
  delivered:        { label: "Delivered",           color: "text-success",    bg: "bg-success-light", dot: "bg-success" },
  cancelled:        { label: "Cancelled",           color: "text-error",      bg: "bg-error-light",   dot: "bg-error" },
};

const ACTIVE_STATUSES = new Set(["placed", "confirmed", "preparing", "ready", "picked_up", "out_for_delivery"]);

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
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ACTIVE_STATUSES.has(status) ? `${m.dot} animate-pulse` : m.dot}`} />
      {m.label}
    </span>
  );
}

function ActiveOrderCard({ order }) {
  const lastStatus = order.statusHistory[order.statusHistory.length - 1];
  const itemNames = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");

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
            <p className="text-sm font-extrabold text-text-primary">₹{order.pricing.total}</p>
            <p className="text-xs text-text-tertiary">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Items */}
        <p className="text-xs text-text-secondary line-clamp-1 mb-4">{itemNames}</p>

        {/* Progress steps */}
        <OrderProgressBar status={order.status} />

        {/* CTA */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/order/${order._id}/track`}
            className="flex-1 h-10 bg-primary text-white text-sm font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <MapPin size={15} /> Track Order
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

function OrderProgressBar({ status }) {
  const steps = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];
  const currentIdx = steps.indexOf(
    ["ready", "picked_up"].includes(status) ? "out_for_delivery" : status
  );

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const last = idx === steps.length - 1;
        const labels = ["Placed", "Confirmed", "Cooking", "On Way", "Done"];

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

function PastOrderCard({ order, onRate }) {
  const itemNames = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  const isRated = !!order.rating;

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
              <Star key={s} size={11} className={s <= order.rating.foodRating ? "text-warning fill-warning" : "text-border-default"} />
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
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [rateOrderData, setRateOrderData] = useState(null);
  const { orders, isLoading, fetchMyOrders, rateOrder } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const active = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const past = orders.filter((o) => !ACTIVE_STATUSES.has(o.status));

  const filteredPast = past.filter((o) =>
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
            { key: "active", label: "Active", count: active.length },
            { key: "past", label: "Past Orders", count: past.length },
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

        {/* Active tab */}
        {tab === "active" && (
          <div className="space-y-4">
            {active.length === 0 ? (
              <EmptyOrders
                icon={Clock}
                title="No active orders"
                desc="Your active orders will appear here. Order something delicious!"
              />
            ) : (
              active.map((o) => <ActiveOrderCard key={o._id} order={o} />)
            )}
          </div>
        )}

        {/* Past tab */}
        {tab === "past" && (
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

            {filteredPast.length === 0 ? (
              <EmptyOrders
                icon={ShoppingBag}
                title="No past orders"
                desc="Your completed and cancelled orders will appear here."
              />
            ) : (
              filteredPast.map((o) => (
                <PastOrderCard key={o._id} order={o} onRate={setRateOrderData} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Rate Order Modal */}
      {rateOrderData && (
        <RateOrderModal order={rateOrderData} onClose={() => setRateOrderData(null)} rateOrder={rateOrder} />
      )}
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

const QUICK_TAGS = [
  "Great taste", "Fast delivery", "Good packaging",
  "Generous portions", "Hot & fresh", "Value for money",
];

function RateOrderModal({ order, onClose, rateOrder }) {
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [hoveredFood, setHoveredFood] = useState(0);
  const [hoveredDelivery, setHoveredDelivery] = useState(0);
  const [tags, setTags] = useState([]);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t) => setTags((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const handleSubmit = async () => {
    try {
      await rateOrder(order._id, { foodRating, deliveryRating, review });
      setSubmitted(true);
      setTimeout(() => onClose(), 800);
    } catch {
      setSubmitted(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[var(--radius-2xl)] sm:rounded-[var(--radius-2xl)] px-5 py-6 space-y-5 max-h-[92vh] overflow-y-auto">

        {/* Handle */}
        <div className="w-10 h-1 bg-border-default rounded-full mx-auto sm:hidden" />

        <div className="text-center">
          <h2 className="text-lg font-extrabold text-text-primary">Rate Your Order</h2>
          <p className="text-sm text-text-secondary mt-0.5">{order.restaurant.name}</p>
        </div>

        {/* Food rating */}
        <div>
          <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>🍔</span> How was the food?
          </p>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                onClick={() => setFoodRating(s)}
                onMouseEnter={() => setHoveredFood(s)}
                onMouseLeave={() => setHoveredFood(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={`transition-colors ${s <= (hoveredFood || foodRating) ? "text-warning fill-warning" : "text-border-default"}`}
                />
              </button>
            ))}
          </div>
          {foodRating > 0 && (
            <p className="text-center text-xs text-text-tertiary mt-2">
              {["", "Poor", "Below Average", "Average", "Good", "Excellent"][foodRating]}
            </p>
          )}
        </div>

        {/* Delivery rating */}
        <div>
          <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>🛵</span> Rate the delivery experience
          </p>
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                onClick={() => setDeliveryRating(s)}
                onMouseEnter={() => setHoveredDelivery(s)}
                onMouseLeave={() => setHoveredDelivery(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={36}
                  className={`transition-colors ${s <= (hoveredDelivery || deliveryRating) ? "text-warning fill-warning" : "text-border-default"}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Quick tags */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Quick Tags</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`h-8 px-3 text-xs font-semibold rounded-full border-2 transition-all ${
                  tags.includes(t)
                    ? "border-primary bg-primary-50 text-primary"
                    : "border-border-light text-text-secondary hover:border-border-default"
                }`}
              >
                {tags.includes(t) ? "✓ " : ""}{t}
              </button>
            ))}
          </div>
        </div>

        {/* Review text */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Write a review <span className="text-text-tertiary text-xs font-normal">(optional)</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell others about your experience…"
            rows={3}
            className="w-full px-4 py-3 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
          <p className="text-xs text-text-tertiary text-right mt-1">{review.length}/300</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={foodRating === 0 || submitted}
          className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitted ? (
            <><CheckCircle2 size={18} /> Thank you!</>
          ) : (
            "Submit Review"
          )}
        </button>
        {foodRating === 0 && (
          <p className="text-xs text-text-tertiary text-center -mt-3">Please rate the food to continue</p>
        )}
      </div>
    </div>
  );
}
