"use client";

import { useState, useEffect } from "react";
import { Tag, X, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import useCartStore from "@/stores/cartStore";
import useCouponStore from "@/stores/couponStore";

export default function CouponModal({ subtotal, onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { restaurant, coupon, applyCoupon, removeCoupon } = useCartStore();
  const { coupons, fetchCoupons, validateCoupon } = useCouponStore();

  useEffect(() => {
    fetchCoupons(restaurant?._id);
  }, [restaurant?._id]);

  const calcDiscount = (c) => {
    if (c.minOrderAmount && subtotal < c.minOrderAmount) return null;
    if (c.type === "percentage") {
      const d = (subtotal * c.value) / 100;
      return c.maxDiscount ? Math.min(d, c.maxDiscount) : d;
    }
    return c.value;
  };

  const handleApplyCode = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Please enter a coupon code"); return; }
    setLoading(true);
    setError("");
    try {
      const validated = await validateCoupon(trimmed, restaurant?._id, subtotal);
      applyCoupon({ ...validated, discount: validated.discount });
      setLoading(false);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid coupon code");
      setLoading(false);
    }
  };

  const handleApplyCoupon = async (c) => {
    const disc = calcDiscount(c);
    if (disc === null) { setError(`Min order ₹${c.minOrderAmount} required for ${c.code}`); return; }
    try {
      const validated = await validateCoupon(c.code, restaurant?._id, subtotal);
      applyCoupon({ ...validated, discount: validated.discount });
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Coupon not valid");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Code input */}
      <div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
              placeholder="Enter coupon code"
              className={`w-full h-11 pl-9 pr-4 text-sm font-mono border rounded-[var(--radius-lg)] uppercase tracking-widest focus:outline-none focus:ring-1 transition-colors placeholder:text-text-tertiary placeholder:normal-case placeholder:tracking-normal
                ${error ? "border-error focus:ring-error/20 bg-error-light/20" : "border-border-light focus:border-primary focus:ring-primary/20"}`}
            />
          </div>
          <button
            onClick={handleApplyCode}
            disabled={loading || !code.trim()}
            className="h-11 px-5 bg-primary text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : "Apply"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-error mt-1.5 flex items-center gap-1">
            <X size={12} /> {error}
          </p>
        )}
      </div>

      {/* Available coupons */}
      <div>
        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
          Available Coupons
        </p>
        <div className="space-y-3">
          {coupons.map((c) => {
            const disc = calcDiscount(c);
            const isApplied = coupon?.code === c.code;
            const isEligible = disc !== null;

            return (
              <div
                key={c._id}
                className={`rounded-[var(--radius-xl)] border-2 overflow-hidden transition-all ${
                  isApplied
                    ? "border-success bg-success-light/30"
                    : isEligible
                      ? "border-border-light hover:border-primary"
                      : "border-border-light opacity-60"
                }`}
              >
                {/* Coupon body */}
                <div className="flex items-start gap-3 p-3">
                  <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${isApplied ? "bg-success" : "bg-primary-50"}`}>
                    <Tag size={18} className={isApplied ? "text-white" : "text-primary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-extrabold text-text-primary font-mono tracking-wider">
                        {c.code}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                          Applied ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{c.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{c.description}</p>
                    {c.minOrderAmount > 0 && (
                      <p className="text-[10px] text-text-tertiary mt-1">
                        Min order: ₹{c.minOrderAmount}
                        {!isEligible && (
                          <span className="text-warning ml-1">
                            (need ₹{c.minOrderAmount - subtotal} more)
                          </span>
                        )}
                      </p>
                    )}
                    {isEligible && disc > 0 && (
                      <p className="text-xs font-bold text-success mt-1">
                        You save ₹{Math.round(disc)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dashed divider */}
                <div className="border-t border-dashed border-border-light mx-3" />

                {/* Apply / Remove action */}
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">
                    Valid till {c.validUntil ? new Date(c.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </span>
                  {isApplied ? (
                    <button onClick={removeCoupon} className="text-xs font-bold text-error hover:underline">
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyCoupon(c)}
                      disabled={!isEligible}
                      className="text-xs font-bold text-primary hover:underline disabled:text-text-tertiary disabled:no-underline flex items-center gap-0.5"
                    >
                      Apply <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
