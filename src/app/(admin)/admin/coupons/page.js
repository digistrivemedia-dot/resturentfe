"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Tag,
  CheckCircle2,
  XCircle,
  Clock4,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  IndianRupee,
  Percent,
  TicketCheck,
  BadgeCheck,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import useAdminCouponStore from "@/stores/adminCouponStore";

const ALL_RESTAURANTS = [
  "Tandoori Nights",
  "Pizza Paradise",
  "Burger Bay",
  "Sushi World",
  "Spice Garden",
  "The Biryani House",
];

const PAGE_SIZE = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode() {
  const prefixes = ["DEAL", "SAVE", "OFF", "SUPER", "FLASH", "MEGA"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${prefix}${num}`;
}

const EMPTY_FORM = {
  code: "",
  type: "percent",
  value: "",
  minOrder: "",
  maxDiscount: "",
  usageLimit: "",
  validFrom: "",
  validTo: "",
  appliesTo: "all",
  restaurants: [],
  status: "active",
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    chip: "bg-success-light text-success-dark",
    dot: "bg-success",
  },
  expired: {
    label: "Expired",
    icon: XCircle,
    chip: "bg-error-light text-error",
    dot: "bg-error",
  },
  draft: {
    label: "Draft",
    icon: Clock4,
    chip: "bg-warning-light text-warning-dark",
    dot: "bg-warning-dark",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-semibold rounded-[var(--radius-full)] ${cfg.chip}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function UsageBar({ used, limit }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor =
    pct >= 100
      ? "bg-error"
      : pct >= 80
      ? "bg-warning-dark"
      : "bg-primary";

  return (
    <div className="space-y-1 min-w-[100px]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-primary font-semibold">
          {used}/{limit}
        </span>
        <span className="text-text-tertiary">{pct}%</span>
      </div>
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const { coupons, isLoading, isSaving, fetchCoupons, createCoupon, updateCoupon, deleteCoupon } =
    useAdminCouponStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch on mount
  useEffect(() => {
    try {
      fetchCoupons({});
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  }, [fetchCoupons]);

  // ── Stats ──
  const totalActive = coupons.filter((c) => c.isActive).length;
  const totalExpired = coupons.filter((c) => {
    const now = new Date();
    return c.validUntil && new Date(c.validUntil) < now;
  }).length;
  const totalRedemptions = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);

  const chips = [
    {
      label: "Total Coupons",
      value: coupons.length,
      icon: Tag,
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      label: "Active",
      value: totalActive,
      icon: BadgeCheck,
      color: "text-success",
      bg: "bg-success-light",
    },
    {
      label: "Expired",
      value: totalExpired,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error-light",
    },
    {
      label: "Total Redemptions",
      value: totalRedemptions.toLocaleString("en-IN"),
      icon: TicketCheck,
      color: "text-warning-dark",
      bg: "bg-warning-light",
    },
  ];

  // ── Derive a normalised status from API coupon shape ──
  function couponStatus(c) {
    if (!c.isActive) return "draft";
    const now = new Date();
    if (c.validUntil && new Date(c.validUntil) < now) return "expired";
    return "active";
  }

  // ── Filters ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter((c) => {
      const matchSearch = !q || c.code.toLowerCase().includes(q);
      const status = couponStatus(c);
      const matchStatus = statusFilter === "all" ? true : status === statusFilter;
      const matchType = typeFilter === "all" ? true : c.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function resetPage() {
    setPage(1);
  }

  // ── Form helpers ──
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(coupon) {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrderAmount ?? ""),
      maxDiscount:
        coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
      usageLimit: String(coupon.usageLimit),
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : "",
      validTo: coupon.validUntil ? coupon.validUntil.slice(0, 10) : "",
      appliesTo: coupon.scope === "restaurant" ? "specific_restaurant" : "all",
      restaurants: coupon.restaurant ? [coupon.restaurant] : [],
      status: couponStatus(coupon),
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function openDuplicate(coupon) {
    setEditingId(null);
    setForm({
      code: `COPY_${coupon.code}`,
      type: coupon.type,
      value: String(coupon.value),
      minOrder: String(coupon.minOrderAmount ?? ""),
      maxDiscount:
        coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
      usageLimit: String(coupon.usageLimit),
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 10) : "",
      validTo: coupon.validUntil ? coupon.validUntil.slice(0, 10) : "",
      appliesTo: coupon.scope === "restaurant" ? "specific_restaurant" : "all",
      restaurants: coupon.restaurant ? [coupon.restaurant] : [],
      status: "draft",
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: null }));
    }
  }

  function toggleRestaurant(name) {
    setForm((prev) => {
      const has = prev.restaurants.includes(name);
      return {
        ...prev,
        restaurants: has
          ? prev.restaurants.filter((r) => r !== name)
          : [...prev.restaurants, name],
      };
    });
  }

  function validate() {
    const errs = {};
    if (!form.code.trim()) errs.code = "Code is required.";
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      errs.value = "Enter a valid value.";
    if (
      !form.minOrder ||
      isNaN(Number(form.minOrder)) ||
      Number(form.minOrder) < 0
    )
      errs.minOrder = "Enter a valid minimum order.";
    if (
      form.type === "percent" &&
      form.maxDiscount !== "" &&
      (isNaN(Number(form.maxDiscount)) || Number(form.maxDiscount) < 0)
    )
      errs.maxDiscount = "Enter a valid max discount.";
    if (
      !form.usageLimit ||
      isNaN(Number(form.usageLimit)) ||
      Number(form.usageLimit) <= 0
    )
      errs.usageLimit = "Enter a valid usage limit.";
    if (!form.validFrom) errs.validFrom = "Required.";
    if (!form.validTo) errs.validTo = "Required.";
    if (
      form.validFrom &&
      form.validTo &&
      form.validTo < form.validFrom
    )
      errs.validTo = "Must be after valid from.";
    if (form.appliesTo === "specific_restaurant" && form.restaurants.length === 0)
      errs.restaurants = "Select at least one restaurant.";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrder),
      maxDiscount:
        form.type === "percent" && form.maxDiscount !== ""
          ? Number(form.maxDiscount)
          : null,
      usageLimit: Number(form.usageLimit),
      validFrom: form.validFrom,
      validUntil: form.validTo,
      scope: form.appliesTo === "specific_restaurant" ? "restaurant" : "global",
      restaurant:
        form.appliesTo === "specific_restaurant" && form.restaurants.length > 0
          ? form.restaurants[0]
          : null,
      isActive: form.status === "active",
    };

    try {
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch (err) {
      console.error("Failed to save coupon", err);
    }
  }

  // ── Delete ──
  function openDelete(coupon) {
    setDeleteTarget(coupon);
  }

  function closeDelete() {
    if (deleting) return;
    setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete coupon", err);
    } finally {
      setDeleting(false);
    }
  }

  // Use store's isSaving as the saving flag for modal buttons
  const saving = isSaving;

  // ── Shared styles ──
  const inputClass =
    "w-full h-9 px-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors";

  const selectClass =
    "h-9 px-3 pr-8 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none";

  const chevronBg = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "16px",
  };

  const labelClass = "block text-sm font-semibold text-text-primary mb-1";
  const errorClass = "text-xs text-error mt-0.5";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">
            Coupon Management
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Create and manage discount coupons across the platform
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3"
            >
              <div
                className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${chip.bg}`}
              >
                <Icon size={18} className={chip.color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-text-primary leading-tight">
                  {chip.value}
                </p>
                <p className="text-xs text-text-tertiary truncate">
                  {chip.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-[var(--radius-md)]">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "expired", label: "Expired" },
            { key: "draft", label: "Draft" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setStatusFilter(s.key);
                resetPage();
              }}
              className={`h-7 px-3 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                statusFilter === s.key
                  ? "bg-white text-text-primary shadow-sm border border-border-light"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            resetPage();
          }}
          className={selectClass}
          style={chevronBg}
        >
          <option value="all">All Types</option>
          <option value="percent">Percent</option>
          <option value="flat">Flat</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                {[
                  "Code",
                  "Type & Value",
                  "Min Order",
                  "Usage",
                  "Valid Period",
                  "Applies To",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-text-tertiary"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-border-light border-t-primary animate-spin" />
                      Loading coupons…
                    </span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-text-tertiary"
                  >
                    No coupons found matching your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    {/* Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm font-bold text-text-primary tracking-wide">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Type + Value */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] shrink-0 ${
                            coupon.type === "percent"
                              ? "bg-primary-50 text-primary"
                              : "bg-success-light text-success-dark"
                          }`}
                        >
                          {coupon.type === "percent" ? (
                            <Percent size={14} />
                          ) : (
                            <IndianRupee size={14} />
                          )}
                        </span>
                        <div>
                          <p className="font-bold text-text-primary">
                            {coupon.type === "percent"
                              ? `${coupon.value}% off`
                              : `₹${coupon.value} off`}
                          </p>
                          {coupon.type === "percent" && coupon.maxDiscount && (
                            <p className="text-xs text-text-tertiary">
                              max ₹{coupon.maxDiscount}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Min Order */}
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary font-medium">
                      ₹{coupon.minOrderAmount ?? 0}
                    </td>

                    {/* Usage bar */}
                    <td className="px-4 py-3">
                      <UsageBar used={coupon.usedCount ?? 0} limit={coupon.usageLimit} />
                    </td>

                    {/* Valid Period */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-text-primary text-xs font-medium">
                        {formatDate(coupon.validFrom)}
                      </p>
                      <p className="text-text-tertiary text-xs">
                        → {formatDate(coupon.validUntil)}
                      </p>
                    </td>

                    {/* Applies To */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {coupon.scope !== "restaurant" ? (
                        <span className="text-xs text-text-secondary">
                          All Restaurants
                        </span>
                      ) : (
                        <div className="max-w-[140px]">
                          <p className="text-xs text-text-secondary truncate">
                            {coupon.restaurant || "Specific Restaurant"}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={couponStatus(coupon)} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(coupon)}
                          title="Edit"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-text-tertiary hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => openDuplicate(coupon)}
                          title="Duplicate"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-text-tertiary hover:text-success hover:bg-success-light transition-colors cursor-pointer"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(coupon)}
                          title="Delete"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-text-tertiary hover:text-error hover:bg-error-light transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-text-tertiary">
            Showing{" "}
            {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} coupons
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
              Prev
            </button>
            <span className="text-sm font-semibold text-text-primary px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Coupon" : "New Coupon"}
        size="lg"
        footer={
          <>
            <button
              onClick={closeModal}
              disabled={saving}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 text-sm font-semibold rounded-[var(--radius-md)] bg-primary text-white hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer min-w-[90px] flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </>
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Create Coupon"
              )}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Code + auto-generate */}
          <div>
            <label className={labelClass}>
              Coupon Code <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SAVE50"
                value={form.code}
                onChange={(e) =>
                  setField("code", e.target.value.toUpperCase())
                }
                className={`${inputClass} flex-1 font-mono font-bold tracking-widest`}
              />
              <button
                type="button"
                onClick={() => setField("code", generateCode())}
                title="Auto-generate code"
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-secondary border border-border-light hover:text-primary hover:border-primary transition-colors cursor-pointer shrink-0"
              >
                <Shuffle size={14} />
                Generate
              </button>
            </div>
            {formErrors.code && (
              <p className={errorClass}>{formErrors.code}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Discount Type</label>
            <div className="flex gap-3">
              {[
                { val: "percent", label: "Percentage (%)", Icon: Percent },
                { val: "flat", label: "Flat Amount (₹)", Icon: IndianRupee },
              ].map(({ val, label, Icon }) => (
                <label
                  key={val}
                  className={`flex-1 flex items-center gap-2.5 h-10 px-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors ${
                    form.type === val
                      ? "border-primary bg-primary-50 text-primary"
                      : "border-border-light bg-bg-secondary text-text-secondary hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={val}
                    checked={form.type === val}
                    onChange={() => setField("type", val)}
                    className="sr-only"
                  />
                  <Icon size={15} />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Value + Min Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {form.type === "percent" ? "Discount %" : "Discount Amount (₹)"}{" "}
                <span className="text-error">*</span>
              </label>
              <input
                type="number"
                placeholder={form.type === "percent" ? "e.g. 30" : "e.g. 100"}
                value={form.value}
                min="0"
                onChange={(e) => setField("value", e.target.value)}
                className={inputClass}
              />
              {formErrors.value && (
                <p className={errorClass}>{formErrors.value}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                Min Order (₹) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 300"
                value={form.minOrder}
                min="0"
                onChange={(e) => setField("minOrder", e.target.value)}
                className={inputClass}
              />
              {formErrors.minOrder && (
                <p className={errorClass}>{formErrors.minOrder}</p>
              )}
            </div>
          </div>

          {/* Max Discount (percent only) + Usage Limit */}
          <div className="grid grid-cols-2 gap-4">
            {form.type === "percent" && (
              <div>
                <label className={labelClass}>Max Discount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 200 (optional)"
                  value={form.maxDiscount}
                  min="0"
                  onChange={(e) => setField("maxDiscount", e.target.value)}
                  className={inputClass}
                />
                {formErrors.maxDiscount && (
                  <p className={errorClass}>{formErrors.maxDiscount}</p>
                )}
              </div>
            )}
            <div className={form.type !== "percent" ? "col-span-2" : ""}>
              <label className={labelClass}>
                Usage Limit <span className="text-error">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={form.usageLimit}
                min="1"
                onChange={(e) => setField("usageLimit", e.target.value)}
                className={inputClass}
              />
              {formErrors.usageLimit && (
                <p className={errorClass}>{formErrors.usageLimit}</p>
              )}
            </div>
          </div>

          {/* Valid From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Valid From <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setField("validFrom", e.target.value)}
                className={inputClass}
              />
              {formErrors.validFrom && (
                <p className={errorClass}>{formErrors.validFrom}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>
                Valid To <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setField("validTo", e.target.value)}
                className={inputClass}
              />
              {formErrors.validTo && (
                <p className={errorClass}>{formErrors.validTo}</p>
              )}
            </div>
          </div>

          {/* Applies To */}
          <div>
            <label className={labelClass}>Applies To</label>
            <div className="flex gap-3">
              {[
                { val: "all", label: "All Restaurants" },
                { val: "specific_restaurant", label: "Specific Restaurant(s)" },
              ].map(({ val, label }) => (
                <label
                  key={val}
                  className={`flex-1 flex items-center gap-2.5 h-10 px-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors ${
                    form.appliesTo === val
                      ? "border-primary bg-primary-50 text-primary"
                      : "border-border-light bg-bg-secondary text-text-secondary hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value={val}
                    checked={form.appliesTo === val}
                    onChange={() => setField("appliesTo", val)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Restaurant selector */}
          {form.appliesTo === "specific_restaurant" && (
            <div>
              <label className={labelClass}>
                Select Restaurants <span className="text-error">*</span>
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-bg-secondary rounded-[var(--radius-md)] border border-border-light">
                {ALL_RESTAURANTS.map((r) => {
                  const selected = form.restaurants.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => toggleRestaurant(r)}
                      className={`h-7 px-3 text-xs font-semibold rounded-[var(--radius-full)] border transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-text-secondary border-border-light hover:border-primary/50 hover:text-text-primary"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {formErrors.restaurants && (
                <p className={errorClass}>{formErrors.restaurants}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <div className="flex gap-3">
              {["active", "draft", "expired"].map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <label
                    key={s}
                    className={`flex-1 flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors ${
                      form.status === s
                        ? `${cfg.chip} border-transparent`
                        : "border-border-light bg-bg-secondary text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => setField("status", s)}
                      className="sr-only"
                    />
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                    />
                    <span className="text-xs font-semibold capitalize">
                      {cfg.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={closeDelete}
        title="Delete Coupon"
        size="sm"
        footer={
          <>
            <button
              onClick={closeDelete}
              disabled={deleting}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-error text-white hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Coupon"
              )}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete coupon{" "}
            <span className="font-mono font-bold text-text-primary">
              {deleteTarget?.code}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="bg-error-light rounded-[var(--radius-lg)] p-3 flex items-start gap-2">
            <XCircle size={16} className="text-error shrink-0 mt-0.5" />
            <p className="text-xs text-error">
              All redemption history and usage data for this coupon will be
              permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
