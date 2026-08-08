"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Trash2, Plus, Minus, Tag, ChevronRight,
  ShoppingBag, AlertCircle, Pencil, X, MessageSquare,
} from "lucide-react";
import { Modal } from "@/components/ui";
import CouponModal from "@/components/customer/CouponModal";
import useCartStore from "@/stores/cartStore";
import useOrderTypeSettingsStore from "@/stores/orderTypeSettingsStore";
import { ORDER_TYPES } from "@/constants";

export default function CartPage() {
  const router = useRouter();
  const [couponOpen, setCouponOpen] = useState(false);
  const [clearWarning, setClearWarning] = useState(false);

  const {
    restaurant, items, coupon, orderType, orderTypeLocked,
    removeItem, updateQuantity, removeCoupon, setOrderType, clearCart,
    getSubtotal, getCouponDiscount, getTotal,
  } = useCartStore();
  const { enabledMap: orderTypesEnabled } = useOrderTypeSettingsStore();

  const availableOrderTypes = ORDER_TYPES.filter((t) => orderTypesEnabled[t.id] !== false);
  const selectedOrderType = ORDER_TYPES.find((t) => t.id === orderType);

  // If the currently selected order type gets disabled platform-wide, fall back to
  // the first still-available one — even if it was "locked" via the quick-order flow,
  // since showing a dead option as selected (locked or not) is worse than switching it
  useEffect(() => {
    if (orderTypesEnabled[orderType] === false && availableOrderTypes.length > 0) {
      setOrderType(availableOrderTypes[0].id);
    }
  }, [orderTypesEnabled, orderType]);

  const subtotal = getSubtotal();
  const couponDiscount = getCouponDiscount();
  const total = getTotal();

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

        {/* ── Order type ── */}
        {orderTypeLocked ? (
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-3.5 mb-5 flex items-center gap-3">
            {selectedOrderType && (
              <selectedOrderType.icon size={18} className="text-primary shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">{selectedOrderType?.label}</p>
              <p className="text-xs text-text-tertiary">{selectedOrderType?.desc}</p>
            </div>
            <Link
              href={`/quick-order/order-type?restaurant=${restaurant.slug}`}
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Change
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden mb-5">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-sm font-bold text-text-primary">How would you like your order?</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {availableOrderTypes.map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOrderType(id)}
                  className={`text-left p-3 rounded-[var(--radius-lg)] border-2 transition-all ${
                    orderType === id ? "border-primary bg-primary-50" : "border-border-light hover:border-border-default"
                  }`}
                >
                  <Icon size={18} className={orderType === id ? "text-primary" : "text-text-secondary"} />
                  <p className="text-sm font-semibold text-text-primary mt-2">{label}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

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
                <p className="text-sm font-bold text-success">Coupon applied!</p>
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
