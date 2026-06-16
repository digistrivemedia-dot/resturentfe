"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Shuffle,
  TicketPercent,
  IndianRupee,
  Truck,
  Loader2,
  Info,
  Calendar,
  Users,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import useRestaurantCouponStore, { mapCouponFromBackend } from "@/stores/restaurantCouponStore";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const ADJECTIVES = [
  "MEGA", "SUPER", "FLASH", "SPECIAL", "HAPPY", "LUCKY", "FESTIVE", "GRAND",
];
const NOUNS = [
  "DEAL", "SAVE", "OFFER", "FEAST", "BITE", "TREAT", "DELIGHT", "FEAST",
];

function generateCode() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${adj}${num}`;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  maxDiscount: "",
  minOrder: "",
  usageLimit: "",
  perUserLimit: "",
  validFrom: "",
  validTo: "",
  status: "active",
};

function formFromCoupon(c) {
  return {
    code: c.code,
    description: c.description || "",
    type: c.type,
    value: c.value !== null && c.value !== undefined ? String(c.value) : "",
    maxDiscount: c.maxDiscount !== null && c.maxDiscount !== undefined ? String(c.maxDiscount) : "",
    minOrder: c.minOrder !== null && c.minOrder !== undefined ? String(c.minOrder) : "",
    usageLimit: c.usageLimit !== null && c.usageLimit !== undefined ? String(c.usageLimit) : "",
    perUserLimit: c.perUserLimit !== null && c.perUserLimit !== undefined ? String(c.perUserLimit) : "",
    validFrom: c.validFrom || "",
    validTo: c.validTo || "",
    status: c.status === "paused" || c.status === "expired" ? "active" : (c.status || "active"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-bg-primary border border-border-light rounded-[var(--radius-lg)] p-6">
      <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-text-primary mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 ${props.className || ""}`}
    />
  );
}

function Hint({ children }) {
  return (
    <p className="mt-1 text-xs text-text-secondary flex items-center gap-1">
      <Info size={11} />
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview Card
// ─────────────────────────────────────────────────────────────────────────────
function PreviewCard({ form }) {
  const hasCode = form.code.trim().length > 0;

  function getDiscountLine() {
    if (form.type === "percent") {
      const val = form.value ? `${form.value}%` : "??%";
      const cap = form.maxDiscount ? ` (up to ₹${form.maxDiscount})` : "";
      return `${val} OFF${cap}`;
    }
    if (form.type === "flat") {
      return form.value ? `₹${form.value} OFF` : "₹?? OFF";
    }
    return "FREE DELIVERY";
  }

  function getConditionsLine() {
    const parts = [];
    if (form.minOrder) parts.push(`Min order ₹${form.minOrder}`);
    if (form.usageLimit) parts.push(`${form.usageLimit} uses total`);
    if (form.perUserLimit) parts.push(`${form.perUserLimit} per user`);
    return parts.length ? parts.join(" · ") : "No conditions set";
  }

  function getValidityLine() {
    if (form.validFrom && form.validTo) {
      return `${formatDate(form.validFrom)} – ${formatDate(form.validTo)}`;
    }
    if (form.validFrom) return `From ${formatDate(form.validFrom)}`;
    return "Validity not set";
  }

  return (
    <div className="sticky top-24">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Customer Preview
      </p>
      <div
        className="rounded-[var(--radius-xl)] overflow-hidden border"
        style={{ borderColor: "#FF572240" }}
      >
        {/* Top banner */}
        <div
          className="px-5 py-4"
          style={{ backgroundColor: "#FF5722" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Tag size={16} className="text-white/80" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Coupon
            </span>
          </div>
          <p className="font-mono font-extrabold text-2xl text-white tracking-widest">
            {hasCode ? form.code : "YOUR-CODE"}
          </p>
        </div>

        {/* Body */}
        <div className="bg-bg-primary px-5 py-4 flex flex-col gap-3">
          {/* Discount */}
          <div>
            <p
              className="text-xl font-extrabold"
              style={{ color: "#FF5722" }}
            >
              {getDiscountLine()}
            </p>
            {form.description && (
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {/* Divider */}
          <div
            className="border-t border-dashed"
            style={{ borderColor: "#FF572230" }}
          />

          {/* Conditions */}
          <div className="flex items-start gap-2">
            <ShoppingCart size={13} className="text-text-secondary mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">
              {getConditionsLine()}
            </p>
          </div>

          {/* Validity */}
          <div className="flex items-start gap-2">
            <Calendar size={13} className="text-text-secondary mt-0.5 shrink-0" />
            <p className="text-xs text-text-secondary">{getValidityLine()}</p>
          </div>
        </div>

        {/* Status chip */}
        <div className="bg-bg-secondary px-5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-text-secondary">Status</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              form.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {form.status === "active" ? "Active" : "Draft"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner form (uses useSearchParams — must be inside Suspense)
// ─────────────────────────────────────────────────────────────────────────────
function CouponFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);

  const { coupons: rawCoupons, fetchCoupons, createCoupon, updateCoupon, isSaving } = useRestaurantCouponStore();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch coupons on mount so we can pre-fill edit mode
  useEffect(() => {
    async function load() {
      try {
        const list = await fetchCoupons();
        if (editId && list) {
          const existing = list.find((c) => c._id === editId);
          if (existing) {
            setForm(formFromCoupon(mapCouponFromBackend(existing)));
          }
        }
      } catch (err) {
        // If fetch fails in edit mode, form stays empty
      }
      setStoreLoaded(true);
    }
    load();
  }, []);

  // Once coupons are in store and storeLoaded, fill form for edit
  useEffect(() => {
    if (storeLoaded && isEdit && rawCoupons.length > 0) {
      const existing = rawCoupons.find((c) => c._id === editId);
      if (existing) {
        setForm(formFromCoupon(mapCouponFromBackend(existing)));
      }
    }
  }, [storeLoaded, rawCoupons.length]);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  }

  function validate() {
    const e = {};
    if (!form.code.trim()) e.code = "Coupon code is required";
    if (form.type !== "freeDelivery" && (!form.value || Number(form.value) <= 0))
      e.value = "Please enter a valid discount value";
    if (form.type === "percent" && Number(form.value) > 100)
      e.value = "Percentage cannot exceed 100";
    if (!form.validFrom) e.validFrom = "Start date is required";
    if (!form.validTo) e.validTo = "End date is required";
    if (form.validFrom && form.validTo && form.validFrom > form.validTo)
      e.validTo = "End date must be after start date";
    return e;
  }

  async function handlePublish() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    try {
      // Build form data — use description as title if backend requires it
      const formData = {
        ...form,
        title: form.description || form.code,
        value: form.type === "freeDelivery" ? 0 : Number(form.value),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      };
      if (isEdit) {
        await updateCoupon(editId, formData);
      } else {
        await createCoupon(formData);
      }
      router.push("/restaurant/coupons");
    } catch (err) {
      // error stored in store
    }
  }

  function handleDraft() {
    set("status", "draft");
    router.push("/restaurant/coupons");
  }

  const TYPE_OPTIONS = [
    {
      value: "percent",
      label: "Percentage Off",
      description: "e.g. 20% off the order total",
      icon: TicketPercent,
    },
    {
      value: "flat",
      label: "Flat Amount Off",
      description: "e.g. ₹50 off the order total",
      icon: IndianRupee,
    },
    {
      value: "freeDelivery",
      label: "Free Delivery",
      description: "Waive delivery charges entirely",
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-bg-primary border-b border-border-light">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm">
            <span
              className="text-text-secondary hover:text-text-primary cursor-pointer"
              onClick={() => router.push("/restaurant/coupons")}
            >
              Coupons
            </span>
            <ChevronRight size={14} className="text-text-secondary" />
            <span className="font-semibold text-text-primary">
              {isEdit ? "Edit Coupon" : "Create New"}
            </span>
            {isEdit && (
              <>
                <ChevronRight size={14} className="text-text-secondary" />
                <span className="font-mono text-[#FF5722] font-semibold">
                  {form.code || editId}
                </span>
              </>
            )}
          </nav>

          {/* Action buttons (mirrored from footer for sticky access) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => router.push("/restaurant/coupons")}
              className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary border border-border-light hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDraft}
              className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary border border-border-light hover:bg-bg-secondary transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold text-white inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-70 transition-opacity"
              style={{ backgroundColor: "#FF5722" }}
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? "Publishing…" : isEdit ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left: form */}
          <div className="flex flex-col gap-6">
            {/* 1. Basic Info */}
            <Section title="Basic Info">
              <div className="flex flex-col gap-5">
                {/* Code */}
                <div>
                  <Label required>Coupon Code</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) =>
                        set("code", e.target.value.toUpperCase().replace(/\s/g, ""))
                      }
                      placeholder="e.g. SAVE50"
                      maxLength={20}
                      className={`flex-1 px-3 py-2.5 text-sm font-mono bg-bg-secondary border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 uppercase ${
                        errors.code ? "border-red-400" : "border-border-light"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => set("code", generateCode())}
                      title="Auto-generate code"
                      className="px-3 py-2.5 rounded-[var(--radius-md)] border border-border-light text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                    >
                      <Shuffle size={16} />
                    </button>
                  </div>
                  {errors.code ? (
                    <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                  ) : (
                    <Hint>Customers enter this code at checkout. Use caps, no spaces.</Hint>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label>Description</Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={2}
                    placeholder="Brief description shown to customers…"
                    className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 resize-none"
                  />
                </div>
              </div>
            </Section>

            {/* 2. Discount Type */}
            <Section title="Discount Type">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = form.type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        set("type", opt.value);
                        if (opt.value === "freeDelivery") set("value", "0");
                      }}
                      className={`flex flex-col items-start gap-2 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all ${
                        selected
                          ? "border-[#FF5722] bg-[#FF57220A]"
                          : "border-border-light hover:border-[#FF572260] hover:bg-bg-secondary"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
                        style={{
                          backgroundColor: selected ? "#FF57221A" : "var(--bg-secondary)",
                        }}
                      >
                        <Icon
                          size={18}
                          style={{ color: selected ? "#FF5722" : "var(--text-secondary)" }}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            selected ? "text-[#FF5722]" : "text-text-primary"
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 3. Discount Value */}
            {form.type !== "freeDelivery" && (
              <Section title="Discount Value">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label required>
                      {form.type === "percent" ? "Discount Percentage" : "Flat Discount Amount"}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary font-medium">
                        {form.type === "percent" ? "%" : "₹"}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={form.type === "percent" ? 100 : undefined}
                        value={form.value}
                        onChange={(e) => set("value", e.target.value)}
                        placeholder={form.type === "percent" ? "e.g. 20" : "e.g. 50"}
                        className={`w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 ${
                          errors.value ? "border-red-400" : "border-border-light"
                        }`}
                      />
                    </div>
                    {errors.value && (
                      <p className="mt-1 text-xs text-red-500">{errors.value}</p>
                    )}
                  </div>

                  {form.type === "percent" && (
                    <div>
                      <Label>Max Discount Cap</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary font-medium">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={form.maxDiscount}
                          onChange={(e) => set("maxDiscount", e.target.value)}
                          placeholder="e.g. 100"
                          className="w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                        />
                      </div>
                      <Hint>Maximum rupees a customer can save. Leave blank for no cap.</Hint>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* 4. Conditions */}
            <Section title="Conditions">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <Label>Min Order Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={form.minOrder}
                      onChange={(e) => set("minOrder", e.target.value)}
                      placeholder="e.g. 199"
                      className="w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                    />
                  </div>
                  <Hint>Leave blank for no minimum.</Hint>
                </div>

                <div>
                  <Label>Total Usage Limit</Label>
                  <div className="relative">
                    <Users
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                    <input
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => set("usageLimit", e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                    />
                  </div>
                  <Hint>Max times coupon can be redeemed.</Hint>
                </div>

                <div>
                  <Label>Per User Limit</Label>
                  <div className="relative">
                    <Users
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                    <input
                      type="number"
                      min="1"
                      value={form.perUserLimit}
                      onChange={(e) => set("perUserLimit", e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                    />
                  </div>
                  <Hint>How many times one customer can use this.</Hint>
                </div>
              </div>
            </Section>

            {/* 5. Validity */}
            <Section title="Validity Period">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label required>Valid From</Label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => set("validFrom", e.target.value)}
                      className={`w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 ${
                        errors.validFrom ? "border-red-400" : "border-border-light"
                      }`}
                    />
                  </div>
                  {errors.validFrom && (
                    <p className="mt-1 text-xs text-red-500">{errors.validFrom}</p>
                  )}
                </div>

                <div>
                  <Label required>Valid To</Label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                    />
                    <input
                      type="date"
                      value={form.validTo}
                      min={form.validFrom || undefined}
                      onChange={(e) => set("validTo", e.target.value)}
                      className={`w-full pl-8 pr-3 py-2.5 text-sm bg-bg-secondary border rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 ${
                        errors.validTo ? "border-red-400" : "border-border-light"
                      }`}
                    />
                  </div>
                  {errors.validTo && (
                    <p className="mt-1 text-xs text-red-500">{errors.validTo}</p>
                  )}
                </div>
              </div>
            </Section>

            {/* 6. Status */}
            <Section title="Publication Status">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "active",
                    label: "Active",
                    description: "Coupon is live and usable by customers immediately.",
                    dot: "bg-green-500",
                  },
                  {
                    value: "draft",
                    label: "Draft",
                    description: "Save for later. Customers cannot see or use it yet.",
                    dot: "bg-blue-500",
                  },
                ].map((opt) => {
                  const selected = form.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("status", opt.value)}
                      className={`flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all ${
                        selected
                          ? "border-[#FF5722] bg-[#FF57220A]"
                          : "border-border-light hover:border-[#FF572260] hover:bg-bg-secondary"
                      }`}
                    >
                      {/* Radio indicator */}
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selected ? "border-[#FF5722]" : "border-border-light"
                        }`}
                      >
                        {selected && (
                          <div className="w-2 h-2 rounded-full bg-[#FF5722]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              selected ? "text-[#FF5722]" : "text-text-primary"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          {/* Right: preview */}
          <div>
            <PreviewCard form={form} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border-light">
          <button
            onClick={() => router.push("/restaurant/coupons")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary border border-border-light hover:bg-bg-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDraft}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary border border-border-light hover:bg-bg-primary transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-opacity"
            style={{ backgroundColor: "#FF5722" }}
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? "Publishing…" : isEdit ? "Update Coupon" : "Publish Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page export — wraps inner form in Suspense for useSearchParams
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateCouponPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-[#FF5722]" />
        </div>
      }
    >
      <CouponFormInner />
    </Suspense>
  );
}
