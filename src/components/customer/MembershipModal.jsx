"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui";
import api from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import useAuthStore from "@/stores/authStore";

const BENEFITS = [
  "Discount on every order, automatically applied",
  "No coupon codes to remember",
  "Priority support",
];

export default function MembershipModal({ isOpen, onClose, onPurchased }) {
  const { user, fetchMe } = useAuthStore();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api
      .get("/customer/membership")
      .then((res) => setMembership(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  async function handleBuy() {
    setPurchasing(true);
    try {
      const checkoutRes = await api.post("/customer/membership/checkout");
      const { razorpay } = checkoutRes.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Payment gateway failed to load. Please try again.");
        setPurchasing(false);
        return;
      }

      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: "Sri Isha Cafe",
        description: "Membership — discount on every order",
        order_id: razorpay.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/customer/membership/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setMembership((m) => ({ ...m, ...verifyRes.data }));
            await fetchMe();
            toast.success("Membership activated! Enjoy your discount.");
            onPurchased?.();
          } catch {
            toast.error("Payment succeeded but activation failed — contact support.");
          }
          setPurchasing(false);
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setPurchasing(false);
          },
        },
        prefill: { name: user?.name || "", email: user?.email || "", contact: user?.phone || "" },
        theme: { color: "#FF6B35" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed");
        setPurchasing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start membership purchase");
      setPurchasing(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={22} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={26} className="text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-text-primary">Keep the savings going</h3>
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
              You&apos;ve used up your new-customer discount — become a member to keep saving on every order.
            </p>
          </div>

          <div className="bg-bg-secondary rounded-2xl border border-border-light p-4 space-y-2.5">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary">{b}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-2xl font-extrabold text-text-primary">
              ₹{membership?.price ?? 299}
              <span className="text-sm font-medium text-text-tertiary">/month</span>
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              {membership?.discountPercent ?? 20}% off every order
            </p>
          </div>

          <button
            onClick={handleBuy}
            disabled={purchasing}
            className="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {purchasing ? <Loader2 size={16} className="animate-spin" /> : "Buy Membership"}
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Maybe later
          </button>
        </div>
      )}
    </Modal>
  );
}
