"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Plus, ChevronRight, CreditCard,
  Smartphone, Banknote, Wallet, ChevronDown, Loader2, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/stores/cartStore";
import useLocationStore from "@/stores/locationStore";
import useAuthStore from "@/stores/authStore";
import useOrderStore from "@/stores/orderStore";

const PAYMENT_METHODS = [
  {
    id: "online",
    label: "Pay Online",
    desc: "UPI, Cards, Net Banking, Wallets",
    icon: Smartphone,
    tag: "Recommended",
    tagColor: "bg-success-light text-success",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: Banknote,
    tag: null,
  },
  {
    id: "wallet",
    label: "Pay via Wallet",
    desc: "Wallet balance: ₹150",
    icon: Wallet,
    tag: null,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);

  const {
    restaurant, items, coupon,
    getSubtotal, getDeliveryFee, getTaxAmount, getCouponDiscount, getTotal, tip,
    clearCart,
  } = useCartStore();

  const { user } = useAuthStore();
  const { placeOrder, isPlacing } = useOrderStore();
  const { savedAddresses, currentLocation } = useLocationStore();

  // Use user addresses from API, fall back to location store
  const addresses = user?.addresses?.length > 0 ? user.addresses : savedAddresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || null;

  // Track which address is selected for this order (starts as default)
  const [selectedAddrId, setSelectedAddrId] = useState(defaultAddr?._id || null);
  const selectedAddr = addresses.find((a) => a._id === selectedAddrId) || defaultAddr;

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const couponDiscount = getCouponDiscount();
  const total = getTotal();
  const platformFee = 3;
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

  const handlePlaceOrder = async () => {
    if (!selectedAddr && !currentLocation) {
      toast.error("Please add a delivery address first");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        restaurantId: restaurant._id,
        items: items.map((item) => ({
          menuItemId: item._id || item.menuItem,
          name: item.name,
          quantity: item.quantity || 1,
          variant: item.variant || null,
          addons: item.addons || [],
          specialInstructions: item.specialInstructions || "",
        })),
        deliveryAddress: {
          label: selectedAddr?.label || "Current Location",
          fullAddress: selectedAddr?.fullAddress || currentLocation?.address || "",
          landmark: selectedAddr?.landmark || "",
          lat: selectedAddr?.lat || currentLocation?.lat,
          lng: selectedAddr?.lng || currentLocation?.lng,
        },
        paymentMethod,
        couponCode: coupon?.code || null,
        tip: tip || 0,
      };
      const order = await placeOrder(orderData);
      clearCart();
      router.push(`/order/confirmed?orderNumber=${order.orderNumber}&orderId=${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
    setLoading(false);
  };

  if (!restaurant || items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-secondary mb-4">Your cart is empty</p>
        <Link href="/home" className="text-primary font-semibold hover:underline">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Checkout</h1>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm font-bold text-text-primary">Delivery Address</span>
          </div>
          <Link href="/address/new?redirect=/checkout" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
            <Plus size={13} /> Add new
          </Link>
        </div>

        {selectedAddr ? (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-3 bg-primary-50 border border-primary/20 rounded-[var(--radius-lg)] p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary capitalize">{selectedAddr.label}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{selectedAddr.fullAddress}</p>
                {selectedAddr.landmark && (
                  <p className="text-xs text-text-tertiary mt-0.5">Near {selectedAddr.landmark}</p>
                )}
              </div>
              <Link href="/address/new?redirect=/checkout" className="text-xs text-primary font-medium hover:underline shrink-0">
                + Add
              </Link>
            </div>

            {/* Other saved addresses — click to select */}
            {addresses.filter((a) => a._id !== selectedAddr._id).length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
                {addresses.filter((a) => a._id !== selectedAddr._id).map((addr) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedAddrId(addr._id)}
                    className="shrink-0 flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-border-default rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <MapPin size={11} className="shrink-0" />
                    <span className="capitalize">{addr.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 pb-4">
            <Link
              href="/address/new?redirect=/checkout"
              className="flex items-center gap-3 border-2 border-dashed border-border-default rounded-[var(--radius-lg)] p-4 hover:border-primary transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
                <Plus size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Add a delivery address</p>
                <p className="text-xs text-text-secondary mt-0.5">Required to place your order</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Order Summary (collapsible) */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <button
          onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">{restaurant.name}</span>
            <span className="text-xs text-text-tertiary">· {itemCount} item{itemCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">₹{Math.round(subtotal)}</span>
            <ChevronDown size={16} className={`text-text-tertiary transition-transform ${orderSummaryOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {orderSummaryOpen && (
          <div className="border-t border-border-light px-4 py-3 space-y-2.5">
            {items.map((item) => {
              const unitPrice = (item.variant?.price || item.price) + (item.addons || []).reduce((s, a) => s + (a.price || 0), 0);
              return (
                <div key={item.cartId} className="flex items-start gap-2 text-sm">
                  <span className="text-text-tertiary">{item.quantity || 1}×</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-text-primary">{item.name}</span>
                    {item.variant && <span className="text-xs text-text-tertiary ml-1">({item.variant.name})</span>}
                    {item.addons?.length > 0 && (
                      <p className="text-xs text-text-tertiary">+ {item.addons.map((a) => a.name).join(", ")}</p>
                    )}
                  </div>
                  <span className="font-medium text-text-primary shrink-0">₹{unitPrice * (item.quantity || 1)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <CreditCard size={16} className="text-primary" /> Payment Method
          </h2>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon, tag, tagColor }) => (
            <label
              key={id}
              className={`flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all ${
                paymentMethod === id
                  ? "border-primary bg-primary-50"
                  : "border-border-light hover:border-border-default"
              }`}
            >
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${
                paymentMethod === id ? "bg-primary/10" : "bg-bg-secondary"
              }`}>
                <Icon size={18} className={paymentMethod === id ? "text-primary" : "text-text-secondary"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{label}</span>
                  {tag && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagColor}`}>{tag}</span>}
                </div>
                <span className="text-xs text-text-secondary">{desc}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                paymentMethod === id ? "border-primary" : "border-border-default"
              }`}>
                {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <input type="radio" name="payment" value={id} checked={paymentMethod === id}
                onChange={() => setPaymentMethod(id)} className="sr-only" />
            </label>
          ))}
        </div>
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
        <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
          <span>🧾</span> Bill Summary
        </h3>
        <div className="space-y-2">
          {[
            { label: "Item total", val: `₹${subtotal}` },
            { label: "Delivery fee", val: deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`, cls: deliveryFee === 0 ? "text-success font-semibold" : "" },
            { label: "Platform fee", val: `₹${platformFee}` },
            { label: "GST (5%)", val: `₹${Math.round(tax)}` },
            tip > 0 ? { label: "Delivery tip", val: `₹${tip}` } : null,
            couponDiscount > 0 ? { label: `Coupon (${coupon?.code})`, val: `-₹${Math.round(couponDiscount)}`, cls: "text-success font-semibold" } : null,
          ].filter(Boolean).map(({ label, val, cls = "" }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{label}</span>
              <span className={`font-medium text-text-primary ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-border-light mt-3 pt-3 flex items-center justify-between">
          <span className="font-bold text-text-primary">Total</span>
          <span className="text-lg font-extrabold text-text-primary">₹{Math.round(total)}</span>
        </div>
        {couponDiscount > 0 && (
          <p className="text-xs text-success font-semibold mt-1 text-right">
            🎉 Saving ₹{Math.round(couponDiscount)} on this order
          </p>
        )}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
        <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-success" /> Safe Payments</span>
        <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-success" /> Secure Checkout</span>
      </div>

      {/* Place Order */}
      <div className="sticky bottom-[var(--bottom-nav-height)] md:bottom-4 -mx-4 px-4 pb-2 pt-1 bg-bg-primary/80 backdrop-blur-sm">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || isPlacing}
          className="w-full h-14 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-between px-5 hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-[var(--shadow-lg)]"
        >
          <div className="text-left">
            <div className="text-xs text-white/80">
              {paymentMethod === "cod" ? "Cash on Delivery" : "Pay Online"}
            </div>
            <div className="text-base font-extrabold">Place Order</div>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span className="text-base font-extrabold">₹{Math.round(total)}</span>
                <ChevronRight size={20} />
              </>
            )}
          </div>
        </button>
        <p className="text-center text-[11px] text-text-tertiary mt-2">
          By placing this order, you agree to our Terms of Service
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}
