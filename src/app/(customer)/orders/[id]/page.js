"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, CreditCard, Download, HelpCircle,
  ChevronRight, Star, CheckCircle2, Clock, RefreshCw,
  Phone, Share2, Navigation, UtensilsCrossed,
  Bike, ExternalLink, AlertCircle,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui";
import useOrderStore from "@/stores/orderStore";
import RateOrderModal from "@/components/customer/RateOrderModal";

const STATUS_META = {
  pending_payment:  { label: "Payment Pending",     color: "text-warning",   bg: "bg-warning-light" },
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
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getDirectionsUrl(address = {}) {
  const destination = address.lat && address.lng ? `${address.lat},${address.lng}` : address.fullAddress;
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null;
}

function getAddressText(address = {}) {
  return address.fullAddress || [address.area, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

function mergeRestaurantAddress(snapshot = {}, restaurantAddress = {}) {
  return ["fullAddress", "area", "city", "state", "pincode", "lat", "lng"]
    .reduce((merged, key) => ({
      ...merged,
      [key]: snapshot[key] || restaurantAddress[key],
    }), {});
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

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [rateOpen, setRateOpen] = useState(false);

  const { currentOrder: order, isLoading, fetchOrderById } = useOrderStore();

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
  const isDelivery = order.orderType === "delivery";
  const isDineIn = order.orderType === "dine_in";
  const atRestaurant = !isDelivery;
  const restaurantAddress = mergeRestaurantAddress(order.restaurantAddress, order.restaurant?.address);
  const restaurantAddressText = getAddressText(restaurantAddress);
  const directionsUrl = getDirectionsUrl(restaurantAddress);
  const isActive = !["delivered", "cancelled"].includes(order.status);

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
              href={atRestaurant ? `/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}` : `/order/${order._id}/track`}
              className="mt-3 flex items-center justify-center gap-2 h-9 bg-primary text-white text-xs font-bold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
            >
              <MapPin size={13} /> {isDineIn ? "View Booking" : isDelivery ? "Track Live Order" : "View Order"}
            </Link>
          )}
        </div>

        {/* Flash rider info */}
        {isDelivery && order.deliveryTracking?.flash && (
          <>
            {order.deliveryTracking.flash.riderName ? (
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <Bike size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-tertiary">Delivery Partner</p>
                  <p className="text-sm font-semibold text-text-primary">{order.deliveryTracking.flash.riderName}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {order.deliveryTracking.flash.riderContact && (
                    <a href={`tel:${order.deliveryTracking.flash.riderContact}`} className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <Phone size={15} className="text-primary" />
                    </a>
                  )}
                  {order.deliveryTracking.flash.trackingUrl && (
                    <a href={order.deliveryTracking.flash.trackingUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <ExternalLink size={15} className="text-primary" />
                    </a>
                  )}
                </div>
              </div>
            ) : order.deliveryTracking.flash.dispatchFailedReason && isActive ? (
              <div className="bg-error-light rounded-[var(--radius-xl)] px-4 py-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-error shrink-0" />
                <p className="text-xs text-error-dark">No delivery partner available right now. The restaurant has been notified.</p>
              </div>
            ) : null}
          </>
        )}

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
            {p.platformFee > 0 && <BillRow label="Platform fee" value={`₹${p.platformFee}`} />}
            <BillRow label={`GST (${p.taxPercentage}%)`} value={`₹${p.taxAmount}`} />
            {p.packagingCharge > 0 && <BillRow label="Packaging" value={`₹${p.packagingCharge}`} />}
            {p.tip > 0 && <BillRow label="Delivery tip" value={`₹${p.tip}`} />}
            {p.newCustomerDiscount > 0 && (
              <BillRow
                label="New customer discount (50% off items)"
                value={`-₹${p.newCustomerDiscount}`}
                valueClass="text-success font-semibold"
              />
            )}
            {p.membershipDiscount > 0 && (
              <BillRow
                label="Membership discount (20% off items)"
                value={`-₹${p.membershipDiscount}`}
                valueClass="text-success font-semibold"
              />
            )}
            {p.couponDiscount > 0 && (
              <BillRow
                label={`Coupon (${p.couponCode})`}
                value={`-₹${p.couponDiscount}`}
                valueClass="text-success font-semibold"
              />
            )}
            <BillRow label="Total Paid" value={`₹${p.total}`} bold />
          </div>
          {(p.couponDiscount > 0 || p.membershipDiscount > 0 || p.newCustomerDiscount > 0) && (
            <p className="text-xs text-success font-semibold mt-2 text-right">
              🎉 You saved ₹{p.couponDiscount + p.membershipDiscount + p.newCustomerDiscount} on this order
            </p>
          )}
        </div>

        {/* Destination */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            {atRestaurant ? <UtensilsCrossed size={14} className="text-primary" /> : <MapPin size={14} className="text-primary" />}
            {atRestaurant ? "Restaurant Location" : "Delivery Address"}
          </h3>
          {atRestaurant ? (
            <>
              <p className="text-sm font-semibold text-text-primary">{order.restaurant?.name}</p>
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mt-2">Address</p>
              <p className="text-sm text-text-secondary leading-relaxed mt-0.5">{restaurantAddressText || "Restaurant address unavailable"}</p>
              {restaurantAddress.area && <p className="text-xs text-text-tertiary mt-1">{restaurantAddress.area}, {restaurantAddress.city}</p>}
              {order.scheduledFor && <p className="text-xs text-primary font-semibold mt-2">Visit time: {formatTime(order.scheduledFor)}</p>}
              {directionsUrl && (
                <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline">
                  <Navigation size={13} /> Get directions
                </a>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-text-secondary leading-relaxed">{order.deliveryAddress?.fullAddress || "—"}</p>
              {order.deliveryAddress?.landmark && <p className="text-xs text-text-tertiary mt-1">Near {order.deliveryAddress.landmark}</p>}
            </>
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
        {order.rating?.itemRatings?.length > 0 && (
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <h3 className="text-sm font-bold text-text-primary mb-3">Your Rating</h3>
            <div className="space-y-2">
              {order.rating.itemRatings.map((ir, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">{ir.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} className={s <= ir.rating ? "text-warning fill-warning" : "text-border-default"} />
                    ))}
                  </div>
                </div>
              ))}
              {order.rating.deliveryRating > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-dashed border-border-light">
                  <p className="text-sm text-text-secondary">Delivery</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} className={s <= order.rating.deliveryRating ? "text-warning fill-warning" : "text-border-default"} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {order.rating.review && (
              <p className="text-sm text-text-secondary mt-3 italic">&quot;{order.rating.review}&quot;</p>
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
          {isDelivered && !order.rating?.itemRatings?.length ? (
            <button
              onClick={() => setRateOpen(true)}
              className="flex items-center justify-center gap-2 h-11 bg-warning text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-warning/90 transition-colors"
            >
              <Star size={15} /> Rate Order
            </button>
          ) : (
            <Link
              href={`/orders/${order._id}/support`}
              className="flex items-center justify-center gap-2 h-11 border border-border-light text-text-secondary text-sm font-medium rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors"
            >
              <HelpCircle size={15} /> Get Help
            </Link>
          )}
        </div>

        {/* Get Help is always available, even before rating — shown as its own row
            when the grid above is occupied by the Rate Order button */}
        {isDelivered && !order.rating?.itemRatings?.length && (
          <Link
            href={`/orders/${order._id}/support`}
            className="flex items-center justify-center gap-2 h-11 border border-border-light text-text-secondary text-sm font-medium rounded-[var(--radius-xl)] hover:bg-bg-hover transition-colors"
          >
            <HelpCircle size={15} /> Get Help
          </Link>
        )}

        <div className="h-2" />
      </div>

      <RateOrderModal order={order} isOpen={rateOpen} onClose={() => setRateOpen(false)} />
    </>
  );
}
