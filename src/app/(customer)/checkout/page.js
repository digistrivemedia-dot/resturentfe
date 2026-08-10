"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Plus, ChevronRight, CreditCard,
  Smartphone, Banknote, ChevronDown, Loader2, ShieldCheck,
  Bike, CalendarClock, HandCoins,
} from "lucide-react";
import toast from "react-hot-toast";
import useCartStore from "@/stores/cartStore";
import useLocationStore from "@/stores/locationStore";
import useAuthStore from "@/stores/authStore";
import useOrderStore from "@/stores/orderStore";
import usePlatformFeeStore from "@/stores/platformFeeStore";
import useOrderTypeSettingsStore from "@/stores/orderTypeSettingsStore";
import { TIP_OPTIONS } from "@/constants";
import api from "@/lib/api";
import { playOrderPlacedSound } from "@/lib/sound";
import { CheckCircle2, AlertTriangle } from "lucide-react";

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
];

function getLocalDateTimeMin() {
  const date = new Date(Date.now() + 15 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [scheduleMode, setScheduleMode] = useState("asap");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [serviceability, setServiceability] = useState({ serviceable: true, deliveryCost: null, forKey: null });

  const {
    restaurant, items, coupon, orderType, tip, setTip,
    getSubtotal, getDeliveryFee, getTaxAmount, getCouponDiscount,
    clearCart,
  } = useCartStore();

  const { user, fetchMe } = useAuthStore();
  const { placeOrder, isPlacing } = useOrderStore();
  const { savedAddresses, currentLocation } = useLocationStore();
  const { enabled: platformFeeEnabled, amount: platformFeeAmount, fetchPlatformFee } = usePlatformFeeStore();
  const { enabledMap: orderTypesEnabled, fetchOrderTypeSettings } = useOrderTypeSettingsStore();

  // Use user addresses from API, fall back to location store
  const addresses = user?.addresses?.length > 0 ? user.addresses : savedAddresses || [];

  // Track which address is selected for this order
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const selectedAddr = addresses.find((a) => a._id === selectedAddrId) ||
    addresses.find((a) => a.isDefault) ||
    addresses[0] ||
    null;

  // Fetch fresh user data on mount (ensures addresses are loaded)
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    fetchPlatformFee();
    fetchOrderTypeSettings();
  }, [fetchPlatformFee, fetchOrderTypeSettings]);

  // Order type may have been disabled by the superadmin since it was picked on the
  // cart page (e.g. stale persisted cart state) — bounce back to re-select rather
  // than let checkout proceed (and show delivery-only UI) for a dead order type
  useEffect(() => {
    if (orderType && orderTypesEnabled[orderType] === false) {
      toast.error("This order type is no longer available. Please choose another.");
      router.replace("/cart");
    }
  }, [orderType, orderTypesEnabled, router]);

  const isDelivery = orderType === "delivery";
  const dropLat = selectedAddr?.lat || currentLocation?.lat;
  const dropLng = selectedAddr?.lng || currentLocation?.lng;
  const canCheckServiceability = isDelivery && !!restaurant?._id && !!dropLat && !!dropLng;
  const serviceabilityKey = canCheckServiceability ? `${restaurant._id}:${dropLat}:${dropLng}` : null;

  // Check Flash rider serviceability whenever the delivery address changes
  useEffect(() => {
    if (!serviceabilityKey) return;
    let cancelled = false;
    api
      .post("/delivery/serviceability", { restaurantId: restaurant._id, dropLat, dropLng })
      .then((res) => {
        if (cancelled) return;
        const data = res.data || {};
        setServiceability({
          serviceable: data.serviceable !== false,
          deliveryCost: data.deliveryCost ?? null,
          forKey: serviceabilityKey,
        });
      })
      .catch(() => {
        if (cancelled) return;
        // Don't block checkout if the check itself fails
        setServiceability({ serviceable: true, deliveryCost: null, forKey: serviceabilityKey });
      });
    return () => { cancelled = true; };
  }, [serviceabilityKey]);

  const isCheckingServiceability = canCheckServiceability && serviceability.forKey !== serviceabilityKey;
  const isServiceabilityChecked = canCheckServiceability && serviceability.forKey === serviceabilityKey;

  const subtotal = getSubtotal();
  const isDineIn = orderType === "dine_in";
  const showSchedule = isDelivery || isDineIn;
  // Use Flash's real distance-based cost once known; fall back to the restaurant's flat fee
  // while it's still loading (or if Flash couldn't quote one) — same fallback the backend uses.
  const staticDeliveryFee = getDeliveryFee();
  const hasFlashDeliveryCost = isDelivery && isServiceabilityChecked && serviceability.serviceable && serviceability.deliveryCost != null;
  const deliveryFee = hasFlashDeliveryCost ? serviceability.deliveryCost : staticDeliveryFee;
  const tax = getTaxAmount();
  const platformFee = platformFeeEnabled ? platformFeeAmount : 0;
  const rawCouponDiscount = coupon?.type === "free_delivery"
    ? deliveryFee
    : getCouponDiscount();
  // Active membership gets 20% off subtotal — the exact % and actual charge are always
  // recomputed authoritatively server-side; this is just a preview using the standard rate.
  const isMember = !!(user?.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date());
  const rawMembershipDiscount = isMember ? Math.round(subtotal * 0.20 * 100) / 100 : 0;
  // Membership and coupon discounts don't stack — whichever is worth more applies
  const useMembershipDiscount = rawMembershipDiscount > rawCouponDiscount;
  const couponDiscount = useMembershipDiscount ? 0 : rawCouponDiscount;
  const membershipDiscount = useMembershipDiscount ? rawMembershipDiscount : 0;
  const effectiveTip = isDelivery ? tip || 0 : 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - couponDiscount - membershipDiscount + effectiveTip + platformFee);
  const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const restaurantAddress = restaurant?.address || {};

  const handlePlaceOrder = async () => {
    // GPS/pincode location alone (e.g. from the quick-order flow) isn't a real deliverable
    // address — it has no house/flat number or landmark. A proper saved address is required.
    if (isDelivery && !selectedAddr) {
      toast.error("Please add your delivery address (house/flat no. and area) before placing the order");
      return;
    }
    if (isDelivery && isServiceabilityChecked && !serviceability.serviceable) {
      toast.error("Delivery is not available at this address right now");
      return;
    }
    if (scheduleMode === "scheduled" && !scheduledFor) {
      toast.error("Please choose a date and time");
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
        orderType,
        ...(!isDelivery ? {} : {
          deliveryAddress: {
            label: selectedAddr.label,
            fullAddress: selectedAddr.fullAddress,
            landmark: selectedAddr.landmark || "",
            pincode: selectedAddr.pincode || "",
            lat: selectedAddr.lat ?? currentLocation?.lat,
            lng: selectedAddr.lng ?? currentLocation?.lng,
          },
        }),
        scheduledFor: scheduleMode === "scheduled" ? new Date(scheduledFor).toISOString() : null,
        paymentMethod,
        couponCode: coupon?.code || null,
        tip: effectiveTip,
      };

      const result = await placeOrder(orderData);

      // Online payment — open Razorpay checkout
      if (paymentMethod === "online" && result.razorpay) {
        const { loadRazorpay } = await import("@/lib/razorpay");
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error("Payment gateway failed to load. Please try again.");
          setLoading(false);
          return;
        }

        const options = {
          key: result.razorpay.keyId,
          amount: result.razorpay.amount,
          currency: result.razorpay.currency,
          name: "Sri Isha Cafe",
          description: `Order #${result.order.orderNumber}`,
          order_id: result.razorpay.orderId,
          handler: async function (response) {
            try {
              const { verifyPayment } = useOrderStore.getState();
              const verifiedOrder = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              clearCart();
              playOrderPlacedSound();
              router.push(`/order/confirmed?orderNumber=${verifiedOrder.orderNumber}&orderId=${verifiedOrder._id}`);
            } catch (err) {
              toast.error("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment cancelled");
              setLoading(false);
            },
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#FF6B35",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          toast.error(response.error.description || "Payment failed");
          setLoading(false);
        });
        rzp.open();
        return;
      }

      // COD — redirect immediately
      clearCart();
      playOrderPlacedSound();
      router.push(`/order/confirmed?orderNumber=${result.order.orderNumber}&orderId=${result.order._id}`);
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

      {/* Delivery time banner — delivery only, and only while delivery is actually enabled */}
      {isDelivery && orderTypesEnabled.delivery !== false && (
        <div className="flex items-center gap-3 bg-success-light rounded-[var(--radius-xl)] px-4 py-3">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shrink-0">
            <Bike size={15} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-success-dark">Delivery in {restaurant?.deliverySettings?.avgDeliveryTime || 30} mins</p>
            <p className="text-xs text-success-dark/70">Shipment from {restaurant.name}</p>
          </div>
        </div>
      )}

      {/* Tip — delivery only */}
      {isDelivery && (
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <HandCoins size={16} className="text-primary" strokeWidth={1.8} />
            </div>
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
      )}

      {/* Visit / prepare time — not needed for takeout/self service */}
      {showSchedule && (
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <CalendarClock size={16} className="text-primary" />
          <div>
            <h2 className="text-sm font-bold text-text-primary">{isDineIn ? "When will you visit?" : "When should we prepare it?"}</h2>
            <p className="text-xs text-text-secondary mt-0.5">Choose ASAP or schedule a time.</p>
          </div>
        </div>
        <div className="px-4 pb-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {[{ id: "asap", label: "ASAP" }, { id: "scheduled", label: "Choose time" }].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setScheduleMode(option.id)}
                className={`h-10 rounded-[var(--radius-lg)] border text-sm font-semibold transition-colors ${
                  scheduleMode === option.id ? "border-primary bg-primary-50 text-primary" : "border-border-light text-text-secondary hover:border-border-default"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {scheduleMode === "scheduled" && (
            <input
              type="datetime-local"
              value={scheduledFor}
              min={getLocalDateTimeMin()}
              onChange={(event) => setScheduledFor(event.target.value)}
              className="w-full h-11 px-3 text-sm border border-border-default rounded-[var(--radius-lg)] text-text-primary focus:outline-none focus:border-primary"
            />
          )}
        </div>
      </div>
      )}

      {/* Delivery Address / restaurant location */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <span className="text-sm font-bold text-text-primary">{isDelivery ? "Delivery Address" : "Restaurant Location"}</span>
          </div>
          {isDelivery && (
            <Link href="/address/new?redirect=/checkout" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
              <Plus size={13} /> Add new
            </Link>
          )}
        </div>

        {!isDelivery ? (
          <div className="px-4 pb-4">
            <div className="flex items-start gap-3 bg-primary-50 border border-primary/20 rounded-[var(--radius-lg)] p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{restaurant.name}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {restaurantAddress.fullAddress || "Restaurant address will be shown after confirmation."}
                </p>
                {restaurantAddress.area && <p className="text-xs text-text-tertiary mt-0.5">{restaurantAddress.area}, {restaurantAddress.city}</p>}
              </div>
            </div>
            <p className="text-xs text-text-tertiary mt-2">You can use the address to visit and collect your order at the restaurant.</p>
          </div>
        ) : selectedAddr ? (
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
                {selectedAddr.pincode && (
                  <p className="text-xs text-text-tertiary mt-0.5">Pincode {selectedAddr.pincode}</p>
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
                <p className="text-xs text-text-secondary mt-0.5">Required for delivery orders</p>
              </div>
            </Link>
          </div>
        )}

        {/* Flash rider serviceability status */}
        {isDelivery && selectedAddr && isCheckingServiceability && (
          <div className="mx-4 mb-4 flex items-center gap-2 text-xs text-text-tertiary">
            <Loader2 size={13} className="animate-spin" /> Checking delivery availability...
          </div>
        )}
        {isDelivery && selectedAddr && isServiceabilityChecked && (
          <div
            className={`mx-4 mb-4 flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-xs font-medium ${
              serviceability.serviceable
                ? "bg-success-light text-success-dark"
                : "bg-error-light text-error-dark"
            }`}
          >
            {serviceability.serviceable ? (
              <>
                <CheckCircle2 size={14} className="shrink-0" />
                {serviceability.deliveryCost != null
                  ? `Rider available · ₹${Math.round(serviceability.deliveryCost)} delivery fee`
                  : "Rider service is available for this address"}
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="shrink-0" />
                Delivery not available at this address right now
              </>
            )}
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
                  <span className="text-sm font-semibold text-text-primary">{!isDelivery && id === "cod" ? "Pay at Restaurant" : label}</span>
                  {tag && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tagColor}`}>{tag}</span>}
                </div>
                <span className="text-xs text-text-secondary">{!isDelivery && id === "cod" ? "Pay when you visit" : desc}</span>
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
            {
              label: "Delivery fee",
              val: isCheckingServiceability
                ? "Calculating..."
                : deliveryFee === 0 ? "FREE" : `₹${Math.round(deliveryFee)}`,
              cls: !isCheckingServiceability && deliveryFee === 0 ? "text-success font-semibold" : "",
            },
            platformFee > 0 ? { label: "Platform fee", val: `₹${platformFee}` } : null,
            { label: "GST (5%)", val: `₹${Math.round(tax)}` },
            effectiveTip > 0 ? { label: "Delivery tip", val: `₹${effectiveTip}` } : null,
            membershipDiscount > 0 ? { label: "Membership discount (20%)", val: `-₹${Math.round(membershipDiscount)}`, cls: "text-success font-semibold" } : null,
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
        {(couponDiscount > 0 || membershipDiscount > 0) && (
          <p className="text-xs text-success font-semibold mt-1 text-right">
            🎉 Saving ₹{Math.round(couponDiscount + membershipDiscount)} on this order
          </p>
        )}
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
        <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-success" /> Safe Payments</span>
        <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-success" /> Secure Checkout</span>
      </div>

      {/* Place Order */}
      <div className="sticky bottom-0 md:bottom-4 -mx-4 px-4 pb-2 pt-1 bg-bg-primary/80 backdrop-blur-sm">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || isPlacing}
          className="w-full h-14 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-between px-5 hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-[var(--shadow-lg)]"
        >
          <div className="text-left">
            <div className="text-xs text-white/80">
              {paymentMethod === "cod" ? (!isDelivery ? "Pay at Restaurant" : "Cash on Delivery") : "Pay Online"}
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
