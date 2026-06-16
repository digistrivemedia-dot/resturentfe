"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, CreditCard, Download, HelpCircle,
  ChevronRight, Star, CheckCircle2, Clock, RefreshCw,
  Package, Phone, MessageCircle, Share2,
} from "lucide-react";
import { Modal, CardSkeleton } from "@/components/ui";
import useOrderStore from "@/stores/orderStore";

const STATUS_META = {
  placed:           { label: "Order Placed",       color: "text-primary",   bg: "bg-primary-50" },
  confirmed:        { label: "Confirmed",           color: "text-primary",   bg: "bg-primary-50" },
  preparing:        { label: "Preparing",           color: "text-warning",   bg: "bg-warning-light" },
  ready:            { label: "Ready for Pickup",    color: "text-warning",   bg: "bg-warning-light" },
  picked_up:        { label: "Picked Up",           color: "text-primary",   bg: "bg-primary-50" },
  out_for_delivery: { label: "Out for Delivery",    color: "text-primary",   bg: "bg-primary-50" },
  delivered:        { label: "Delivered",           color: "text-success",   bg: "bg-success-light" },
  cancelled:        { label: "Cancelled",           color: "text-error",     bg: "bg-error-light" },
};

const PAYMENT_LABELS = {
  online: "Paid Online",
  cod: "Cash on Delivery",
  wallet: "Wallet",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.placed;
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.bg} ${m.color}`}>
      {m.label}
    </span>
  );
}

function BillRow({ label, value, bold, valueClass = "", subtext }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "pt-3 border-t border-dashed border-border-light mt-3" : ""}`}>
      <div>
        <span className={`text-sm ${bold ? "font-extrabold text-text-primary" : "text-text-secondary"}`}>{label}</span>
        {subtext && <p className="text-xs text-text-tertiary mt-0.5">{subtext}</p>}
      </div>
      <span className={`text-sm ${bold ? "text-lg font-extrabold text-text-primary" : `font-medium text-text-primary ${valueClass}`}`}>
        {value}
      </span>
    </div>
  );
}

const QUICK_TAGS = ["Great taste", "Fast delivery", "Good packaging", "Generous portions", "Hot & fresh", "Value for money"];

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [rateOpen, setRateOpen] = useState(false);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [hoveredFood, setHoveredFood] = useState(0);
  const [hoveredDelivery, setHoveredDelivery] = useState(0);
  const [tags, setTags] = useState([]);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { currentOrder: order, isLoading, fetchOrderById, rateOrder: rateOrderApi } = useOrderStore();

  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  if (isLoading || !order) {
    return (
      <div className="py-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-40 bg-bg-secondary rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const p = order.pricing;
  const isDelivered = order.status === "delivered";
  const isActive = !["delivered", "cancelled"].includes(order.status);

  const toggleTag = (t) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSubmitRating = async () => {
    try {
      await rateOrderApi(order._id, { foodRating, deliveryRating, review });
      setSubmitted(true);
      setTimeout(() => setRateOpen(false), 800);
    } catch {
      setSubmitted(false);
    }
  };

  return (
    <>
      <div className="py-4 max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Order Details</h1>
            <p className="text-xs text-text-tertiary">{order.orderNumber}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="p-2 rounded-[var(--radius-md)] text-text-tertiary hover:bg-bg-hover transition-colors">
              <Share2 size={18} />
            </button>
            <button className="p-2 rounded-[var(--radius-md)] text-text-tertiary hover:bg-bg-hover transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Status card */}
        <div className={`rounded-[var(--radius-xl)] px-5 py-4 ${isDelivered ? "bg-success-light border border-success/20" : isActive ? "bg-primary-50 border border-primary/20" : "bg-error-light border border-error/20"}`}>
          <div className="flex items-center justify-between">
            <div>
              <StatusBadge status={order.status} />
              <p className="text-xs text-text-secondary mt-1.5">
                {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
              </p>
            </div>
            <div>
              {isDelivered && <CheckCircle2 size={36} className="text-success" />}
              {isActive && <Clock size={36} className="text-primary" />}
            </div>
          </div>

          {isDelivered && order.statusHistory.find((h) => h.status === "delivered") && (
            <p className="text-sm font-semibold text-success mt-2">
              Delivered at {formatTime(order.statusHistory.find((h) => h.status === "delivered").timestamp)}
            </p>
          )}

          {isActive && (
            <Link
              href={`/order/${order._id}/track`}
              className="mt-3 flex items-center justify-center gap-2 h-9 bg-primary text-white text-xs font-bold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
            >
              <MapPin size={13} /> Track Live Order
            </Link>
          )}
        </div>

        {/* Restaurant info */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-bg-secondary rounded-[var(--radius-lg)] flex items-center justify-center text-2xl shrink-0">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary">{order.restaurant.name}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
          </div>
          <Link href={`/restaurant/${order.restaurant.slug}`} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
            Menu <ChevronRight size={12} />
          </Link>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light">
            <h3 className="text-sm font-bold text-text-primary">Items Ordered</h3>
          </div>
          <div className="divide-y divide-border-light">
            {order.items.map((item, idx) => (
              <div key={idx} className="px-4 py-3 flex items-start gap-3">
                <span className="text-text-tertiary text-sm mt-0.5">{item.quantity}×</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-text-tertiary mt-0.5">{item.variant.name}</p>
                  )}
                  {item.addons?.length > 0 && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      + {item.addons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-text-primary shrink-0">₹{item.itemTotal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bill breakdown */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <span>🧾</span> Bill Details
          </h3>
          <div className="space-y-2.5">
            <BillRow label="Item total" value={`₹${p.subtotal}`} />
            <BillRow
              label="Delivery fee"
              value={p.deliveryFee === 0 ? "FREE" : `₹${p.deliveryFee}`}
              valueClass={p.deliveryFee === 0 ? "text-success font-semibold" : ""}
            />
            <BillRow label="Platform fee" value={`₹${p.platformFee}`} />
            <BillRow label={`GST (${p.taxPercentage}%)`} value={`₹${p.taxAmount}`} />
            {p.packagingCharge > 0 && <BillRow label="Packaging" value={`₹${p.packagingCharge}`} />}
            {p.tip > 0 && <BillRow label="Delivery tip" value={`₹${p.tip}`} />}
            {p.couponDiscount > 0 && (
              <BillRow
                label={`Coupon (${p.couponCode})`}
                value={`-₹${p.couponDiscount}`}
                valueClass="text-success font-semibold"
              />
            )}
            <BillRow label="Total Paid" value={`₹${p.total}`} bold />
          </div>
          {p.couponDiscount > 0 && (
            <p className="text-xs text-success font-semibold mt-2 text-right">
              🎉 You saved ₹{p.couponDiscount} on this order
            </p>
          )}
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> Delivery Address
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">{order.deliveryAddress.fullAddress}</p>
          {order.deliveryAddress.landmark && (
            <p className="text-xs text-text-tertiary mt-1">Near {order.deliveryAddress.landmark}</p>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center">
            <CreditCard size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Payment Method</p>
            <p className="text-sm font-semibold text-text-primary">{PAYMENT_LABELS[order.paymentMethod] || "Online"}</p>
          </div>
          {order.paymentStatus === "paid" && (
            <span className="ml-auto text-xs font-bold text-success bg-success-light px-2.5 py-1 rounded-full">Paid</span>
          )}
        </div>

        {/* Rating (if rated) */}
        {order.rating && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <h3 className="text-sm font-bold text-text-primary mb-3">Your Rating</h3>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-xs text-text-tertiary mb-1.5">Food</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= order.rating.foodRating ? "text-warning fill-warning" : "text-border-default"} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-tertiary mb-1.5">Delivery</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= order.rating.deliveryRating ? "text-warning fill-warning" : "text-border-default"} />
                  ))}
                </div>
              </div>
            </div>
            {order.rating.review && (
              <p className="text-sm text-text-secondary mt-3 italic">"{order.rating.review}"</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/restaurant/${order.restaurant.slug}`}
            className="flex items-center justify-center gap-2 h-11 border-2 border-primary text-primary text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-50 transition-colors"
          >
            <RefreshCw size={15} /> Reorder
          </Link>
          {isDelivered && !order.rating && (
            <button
              onClick={() => setRateOpen(true)}
              className="flex items-center justify-center gap-2 h-11 bg-warning text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-warning/90 transition-colors"
            >
              <Star size={15} /> Rate Order
            </button>
          )}
          {(!isDelivered || order.rating) && (
            <Link
              href="/support"
              className="flex items-center justify-center gap-2 h-11 border border-border-light text-text-secondary text-sm font-medium rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors"
            >
              <HelpCircle size={15} /> Get Help
            </Link>
          )}
        </div>

        {/* Download receipt */}
        <button className="w-full flex items-center justify-center gap-2 h-11 border border-border-light text-text-secondary text-sm font-medium rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors">
          <Download size={15} /> Download Invoice / Receipt
        </button>

        <div className="h-2" />
      </div>

      {/* Rate Modal */}
      <Modal isOpen={rateOpen} onClose={() => setRateOpen(false)} title="Rate Your Order">
        <div className="space-y-5">
          {/* Food rating */}
          <div>
            <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><span>🍔</span> How was the food?</p>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setFoodRating(s)} onMouseEnter={() => setHoveredFood(s)} onMouseLeave={() => setHoveredFood(0)} className="transition-transform hover:scale-110">
                  <Star size={36} className={`transition-colors ${s <= (hoveredFood || foodRating) ? "text-warning fill-warning" : "text-border-default"}`} />
                </button>
              ))}
            </div>
            {foodRating > 0 && (
              <p className="text-center text-xs text-text-tertiary mt-2">
                {["","Poor","Below Average","Average","Good","Excellent"][foodRating]}
              </p>
            )}
          </div>

          {/* Delivery rating */}
          <div>
            <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><span>🛵</span> Rate the delivery?</p>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setDeliveryRating(s)} onMouseEnter={() => setHoveredDelivery(s)} onMouseLeave={() => setHoveredDelivery(0)} className="transition-transform hover:scale-110">
                  <Star size={36} className={`transition-colors ${s <= (hoveredDelivery || deliveryRating) ? "text-warning fill-warning" : "text-border-default"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick tags */}
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Quick Tags</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((t) => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`h-8 px-3 text-xs font-semibold rounded-full border-2 transition-all ${tags.includes(t) ? "border-primary bg-primary-50 text-primary" : "border-border-light text-text-secondary hover:border-border-default"}`}
                >
                  {tags.includes(t) ? "✓ " : ""}{t}
                </button>
              ))}
            </div>
          </div>

          {/* Review */}
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
          </div>

          <button
            onClick={handleSubmitRating}
            disabled={foodRating === 0 || submitted}
            className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitted ? <><CheckCircle2 size={18} /> Submitted!</> : "Submit Review"}
          </button>
          {foodRating === 0 && <p className="text-xs text-text-tertiary text-center -mt-3">Please rate the food to continue</p>}
        </div>
      </Modal>
    </>
  );
}
