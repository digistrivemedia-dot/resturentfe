"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Trash2, Plus, Minus, Tag, ChevronRight,
  ShoppingBag, AlertCircle, Pencil, X, MessageSquare,
} from "lucide-react";
import { Modal } from "@/components/ui";
import CouponModal from "@/components/customer/CouponModal";
import useCartStore from "@/stores/cartStore";
import { TIP_OPTIONS } from "@/constants";

export default function CartPage() {
  const router = useRouter();
  const [couponOpen, setCouponOpen] = useState(false);
  const [clearWarning, setClearWarning] = useState(false);

  const {
    restaurant, items, coupon, tip,
    removeItem, updateQuantity, removeCoupon, setTip, clearCart,
    getSubtotal, getDeliveryFee, getTaxAmount, getCouponDiscount, getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const couponDiscount = getCouponDiscount();
  const platformFee = 3;
  const total = getTotal();
  const savings = couponDiscount;
  const isFreeDelivery = deliveryFee === 0 && restaurant?.freeDeliveryAbove && subtotal >= restaurant.freeDeliveryAbove;

  if (!restaurant || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-28 h-28 bg-bg-secondary rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-text-tertiary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Your cart is empty</h2>
        <p className="text-text-secondary text-sm mb-6 max-w-xs">
          Looks like you haven&apos;t added anything yet. Start exploring restaurants near you!
        </p>
        <Link href="/home" className="h-11 px-8 bg-primary text-white font-semibold rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors">
          <ShoppingBag size={16} /> Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="py-4 max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Your Cart</h1>
            <Link href={`/restaurant/${restaurant.slug}`} className="text-sm text-primary hover:underline flex items-center gap-0.5">
              {restaurant.name} <ChevronRight size={14} />
            </Link>
          </div>
          <button onClick={() => setClearWarning(true)} className="ml-auto p-2 rounded-[var(--radius-md)] text-text-tertiary hover:text-error hover:bg-error-light transition-colors">
            <Trash2 size={18} />
          </button>
        </div>

        {/* ── Delivery time banner ── */}
        <div className="flex items-center gap-3 bg-success-light rounded-[var(--radius-xl)] px-4 py-3 mb-5">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-base">🛵</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-success-dark">Delivery in {restaurant?.avgDeliveryTime || 35} mins</p>
            <p className="text-xs text-success-dark/70">Shipment from {restaurant.name}</p>
          </div>
        </div>

        {/* ── Cart Items ── */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary">
              {items.reduce((s, i) => s + (i.quantity || 1), 0)} item{items.reduce((s, i) => s + (i.quantity || 1), 0) > 1 ? "s" : ""}
            </h2>
            <Link href={`/restaurant/${restaurant.slug}`} className="text-xs font-semibold text-primary hover:underline">
              + Add more items
            </Link>
          </div>

          {items.map((item, idx) => {
            const unitPrice = (item.variant?.price || item.price) + (item.addons || []).reduce((s, a) => s + (a.price || 0), 0);
            const lineTotal = unitPrice * (item.quantity || 1);
            const hasAddons = item.addons?.length > 0;
            const hasVariant = !!item.variant;

            return (
              <div key={item.cartId} className={`px-4 py-4 ${idx < items.length - 1 ? "border-b border-border-light" : ""}`}>
                <div className="flex items-start gap-3">
                  {/* Veg indicator */}
                  <div className={`mt-1 w-4 h-4 border-2 rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? "border-veg" : "border-non-veg"}`}>
                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-veg" : "bg-non-veg"}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    {hasVariant && (
                      <p className="text-xs text-text-tertiary mt-0.5">{item.variant.name}</p>
                    )}
                    {hasAddons && (
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">
                        + {item.addons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    <p className="text-xs font-medium text-text-secondary mt-1">₹{unitPrice} each</p>
                  </div>

                  {/* Qty + price */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-bold text-text-primary">₹{lineTotal}</p>
                    <div className="flex items-center h-8 border-2 border-primary rounded-[var(--radius-md)] overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) - 1)}
                        className="w-8 h-full flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 h-full flex items-center justify-center text-sm font-bold text-primary tabular-nums">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, (item.quantity || 1) + 1)}
                        className="w-8 h-full flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Special instructions */}
                {item.specialInstructions && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-text-secondary bg-bg-secondary rounded-[var(--radius-md)] px-3 py-2">
                    <MessageSquare size={12} className="shrink-0 mt-0.5" />
                    {item.specialInstructions}
                  </div>
                )}

                {/* Remove */}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => removeItem(item.cartId)}
                    className="flex items-center gap-1 text-xs text-text-tertiary hover:text-error transition-colors"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Coupon ── */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light mb-4 overflow-hidden">
          {coupon ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 rounded-full bg-success-light flex items-center justify-center shrink-0">
                <Tag size={16} className="text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-success">Coupon applied! 🎉</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  <span className="font-semibold text-text-primary">{coupon.code}</span> — You save ₹{Math.round(couponDiscount)}
                </p>
              </div>
              <button onClick={removeCoupon} className="p-1.5 rounded-full text-text-tertiary hover:text-error hover:bg-error-light transition-colors">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCouponOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-4 hover:bg-bg-hover transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Tag size={16} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-primary">Apply Coupon</p>
                <p className="text-xs text-text-tertiary">Save more with exclusive offers</p>
              </div>
              <ChevronRight size={16} className="text-text-tertiary" />
            </button>
          )}
        </div>

        {/* ── Tip ── */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🤝</span>
            <div>
              <p className="text-sm font-bold text-text-primary">Tip your delivery partner</p>
              <p className="text-xs text-text-secondary">100% of the tip goes to them</p>
            </div>
          </div>
          <div className="flex gap-2">
            {TIP_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(amount === tip ? 0 : amount)}
                className={`flex-1 h-9 text-sm font-semibold rounded-[var(--radius-lg)] border-2 transition-all ${
                  tip === amount && amount > 0
                    ? "border-primary bg-primary-50 text-primary"
                    : amount === 0
                      ? "border-border-light text-text-tertiary text-xs"
                      : "border-border-light text-text-primary hover:border-primary"
                }`}
              >
                {amount === 0 ? "No Tip" : `₹${amount}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bill Details ── */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 mb-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <span>🧾</span> Bill Details
          </h3>

          <div className="space-y-2.5">
            <BillRow label="Item total" value={`₹${subtotal}`} />
            <BillRow
              label="Delivery fee"
              value={deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              valueClass={deliveryFee === 0 ? "text-success font-semibold" : ""}
            />
            {isFreeDelivery && (
              <p className="text-xs text-success -mt-1">
                ✓ Free delivery on orders above ₹{restaurant.freeDeliveryAbove}
              </p>
            )}
            <BillRow label="Platform fee" value={`₹${platformFee}`} className="text-xs" />
            <BillRow label="GST & charges (5%)" value={`₹${Math.round(tax)}`} className="text-xs" />
            {tip > 0 && <BillRow label="Delivery tip" value={`₹${tip}`} />}
            {couponDiscount > 0 && (
              <BillRow
                label={`Coupon (${coupon.code})`}
                value={`-₹${Math.round(couponDiscount)}`}
                valueClass="text-success font-semibold"
              />
            )}
          </div>

          <div className="border-t border-dashed border-border-light mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-text-primary">To Pay</span>
              <span className="text-base font-extrabold text-text-primary">₹{Math.round(total)}</span>
            </div>
            {savings > 0 && (
              <p className="text-xs text-success font-semibold mt-1 text-right">
                🎉 You save ₹{Math.round(savings)} on this order
              </p>
            )}
          </div>
        </div>

        {/* ── Checkout CTA ── */}
        <div className="sticky bottom-[var(--bottom-nav-height)] md:bottom-4 left-0 right-0 bg-bg-primary/80 backdrop-blur-sm pb-2 pt-1 -mx-4 px-4">
          <Link
            href="/checkout"
            className="flex items-center justify-between w-full bg-primary text-white font-bold rounded-[var(--radius-xl)] px-5 py-4 hover:bg-primary-dark transition-colors shadow-[var(--shadow-lg)]"
          >
            <span className="text-sm">Proceed to Checkout</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold">₹{Math.round(total)}</span>
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
      </div>

      {/* Coupon Modal */}
      <Modal isOpen={couponOpen} onClose={() => setCouponOpen(false)} title="Apply Coupon" size="sm">
        <CouponModal
          subtotal={subtotal}
          onClose={() => setCouponOpen(false)}
        />
      </Modal>

      {/* Clear cart confirm */}
      <Modal isOpen={clearWarning} onClose={() => setClearWarning(false)} title="Clear cart?" size="sm"
        footer={
          <>
            <button onClick={() => setClearWarning(false)} className="h-10 px-5 text-sm font-semibold text-text-secondary border border-border-default rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors">
              Cancel
            </button>
            <button onClick={() => { clearCart(); setClearWarning(false); }} className="h-10 px-5 text-sm font-semibold text-white bg-error rounded-[var(--radius-lg)] hover:bg-error-dark transition-colors">
              Clear Cart
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          All items from <strong className="text-text-primary">{restaurant?.name}</strong> will be removed from your cart.
        </p>
      </Modal>
    </>
  );
}

function BillRow({ label, value, valueClass = "", className = "" }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-sm font-medium text-text-primary ${valueClass}`}>{value}</span>
    </div>
  );
}
