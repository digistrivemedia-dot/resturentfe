"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Tag,
  Pencil,
  Trash2,
  TicketPercent,
  IndianRupee,
  Truck,
  BarChart2,
  CheckCircle2,
  PauseCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import useRestaurantCouponStore, { mapCouponFromBackend } from "@/stores/restaurantCouponStore";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    className: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
};

const TYPE_CONFIG = {
  percent: {
    label: "% Off",
    icon: TicketPercent,
    className: "bg-purple-100 text-purple-700",
  },
  flat: {
    label: "Flat Off",
    icon: IndianRupee,
    className: "bg-orange-100 text-orange-700",
  },
  freeDelivery: {
    label: "Free Delivery",
    icon: Truck,
    className: "bg-teal-100 text-teal-700",
  },
};

const STATUS_TABS = ["All", "Active", "Paused", "Expired", "Draft"];

function getValueLabel(coupon) {
  if (coupon.type === "percent") return `${coupon.value}% OFF`;
  if (coupon.type === "flat") return `₹${coupon.value} OFF`;
  return "FREE DELIVERY";
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Chip
// ─────────────────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-bg-primary border border-border-light rounded-[var(--radius-lg)] px-5 py-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "1A" }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-text-secondary mb-0.5">{label}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coupon Card
// ─────────────────────────────────────────────────────────────────────────────
function CouponCard({ coupon, onToggle, onDelete, onEdit }) {
  const statusCfg = STATUS_CONFIG[coupon.status] || STATUS_CONFIG.draft;
  const typeCfg = TYPE_CONFIG[coupon.type] || TYPE_CONFIG.flat;
  const TypeIcon = typeCfg.icon;
  const canToggle = coupon.status === "active" || coupon.status === "paused";
  const progressPct =
    coupon.usageLimit > 0
      ? Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)
      : 0;
  const isAlmostFull = progressPct >= 80;

  return (
    <div className="bg-bg-primary border border-border-light rounded-[var(--radius-lg)] p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-lg text-text-primary tracking-wider">
              {coupon.code}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeCfg.className}`}
            >
              <TypeIcon size={11} />
              {typeCfg.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-1">
            {coupon.description}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusCfg.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Value highlight */}
      <div
        className="rounded-[var(--radius-md)] px-4 py-2.5 flex items-center justify-between"
        style={{ backgroundColor: "#FF57220D", border: "1px dashed #FF572240" }}
      >
        <span
          className="text-2xl font-extrabold"
          style={{ color: "#FF5722", letterSpacing: "-0.5px" }}
        >
          {getValueLabel(coupon)}
        </span>
        <div className="text-right text-xs text-text-secondary">
          {coupon.minOrder > 0 && (
            <p>
              Min order{" "}
              <span className="font-semibold text-text-primary">
                ₹{coupon.minOrder}
              </span>
            </p>
          )}
          {coupon.type === "percent" && coupon.maxDiscount && (
            <p>
              Max{" "}
              <span className="font-semibold text-text-primary">
                ₹{coupon.maxDiscount}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Usage progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-text-secondary">
            Used{" "}
            <span className="font-semibold text-text-primary">
              {coupon.usedCount}
            </span>{" "}
            / {coupon.usageLimit}
          </span>
          <span
            className={`font-medium ${isAlmostFull ? "text-amber-600" : "text-text-secondary"}`}
          >
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              backgroundColor: isAlmostFull ? "#F59E0B" : "#FF5722",
            }}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <Clock size={12} />
        <span>
          {formatDate(coupon.validFrom)} – {formatDate(coupon.validTo)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border-light">
        {/* Toggle */}
        <div className="flex items-center gap-2">
          {canToggle && (
            <>
              <button
                onClick={() => onToggle(coupon)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  coupon.status === "active" ? "bg-green-500" : "bg-gray-300"
                }`}
                title={
                  coupon.status === "active" ? "Pause coupon" : "Activate coupon"
                }
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    coupon.status === "active"
                      ? "translate-x-[18px]"
                      : "translate-x-[3px]"
                  }`}
                />
              </button>
              <span className="text-xs text-text-secondary">
                {coupon.status === "active" ? "Active" : "Paused"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(coupon)}
            className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit coupon"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(coupon)}
            className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete coupon"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CouponsPage() {
  const { coupons: rawCoupons, isLoading, fetchCoupons, toggleCoupon, deleteCoupon } = useRestaurantCouponStore();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [deleteModal, setDeleteModal] = useState({ open: false, coupon: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      fetchCoupons();
    } catch (err) {
      // error stored in store
    }
  }, []);

  // Map backend coupons to frontend shape for display
  const coupons = rawCoupons.map(mapCouponFromBackend);

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const redemptionsThisMonth = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const revenueSaved = coupons.reduce((sum, c) => {
    if (c.type === "percent")
      return sum + Math.round(((c.usedCount || 0) * (c.minOrder || 0) * (c.value || 0)) / 100);
    if (c.type === "flat") return sum + (c.usedCount || 0) * (c.value || 0);
    return sum + (c.usedCount || 0) * 30; // avg delivery fee estimate
  }, 0);

  // Filter
  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const matchTab =
        activeTab === "All" ||
        c.status.toLowerCase() === activeTab.toLowerCase();
      const matchSearch =
        !search ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [coupons, search, activeTab]);

  async function handleToggle(coupon) {
    try {
      const newIsActive = coupon.status !== "active";
      await toggleCoupon(coupon._id, newIsActive);
    } catch (err) {
      // error stored in store
    }
  }

  function handleDeleteClick(coupon) {
    setDeleteModal({ open: true, coupon });
  }

  function handleEditClick(coupon) {
    window.location.href = `/restaurant/coupons/new?edit=${coupon._id}`;
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await deleteCoupon(deleteModal.coupon._id);
    } catch (err) {
      // error stored in store
    }
    setDeleting(false);
    setDeleteModal({ open: false, coupon: null });
  }

  const tabCounts = useMemo(() => {
    const counts = { All: coupons.length };
    ["active", "paused", "expired", "draft"].forEach((s) => {
      counts[s.charAt(0).toUpperCase() + s.slice(1)] = coupons.filter(
        (c) => c.status === s
      ).length;
    });
    return counts;
  }, [coupons]);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Coupons</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage discount coupons for your restaurant
            </p>
          </div>
          <Link
            href="/restaurant/coupons/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#FF5722" }}
          >
            <Plus size={16} />
            Create Coupon
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-[#FF5722]" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatChip
                icon={Tag}
                label="Total Coupons"
                value={totalCoupons}
                color="#6366F1"
              />
              <StatChip
                icon={CheckCircle2}
                label="Active"
                value={activeCoupons}
                color="#22C55E"
              />
              <StatChip
                icon={BarChart2}
                label="Redemptions This Month"
                value={redemptionsThisMonth.toLocaleString("en-IN")}
                color="#FF5722"
              />
              <StatChip
                icon={IndianRupee}
                label="Revenue Saved"
                value={`₹${revenueSaved.toLocaleString("en-IN")}`}
                color="#F59E0B"
              />
            </div>

            {/* Filters */}
            <div className="bg-bg-primary border border-border-light rounded-[var(--radius-lg)] p-4 mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by code or description…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30"
                />
              </div>

              {/* Tab filters */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? "text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                    }`}
                    style={
                      activeTab === tab ? { backgroundColor: "#FF5722" } : {}
                    }
                  >
                    {tab}
                    {tabCounts[tab] !== undefined && (
                      <span
                        className={`ml-1.5 text-xs ${
                          activeTab === tab ? "opacity-80" : "text-text-secondary"
                        }`}
                      >
                        {tabCounts[tab]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onToggle={handleToggle}
                    onDelete={handleDeleteClick}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-bg-primary border border-border-light rounded-[var(--radius-xl)] flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
                  <Tag size={28} className="text-text-secondary" />
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  No coupons found
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  {search
                    ? `No results for "${search}"`
                    : `No ${activeTab.toLowerCase()} coupons yet`}
                </p>
                <Link
                  href="/restaurant/coupons/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold text-white"
                  style={{ backgroundColor: "#FF5722" }}
                >
                  <Plus size={15} />
                  Create your first coupon
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => !deleting && setDeleteModal({ open: false, coupon: null })}
        title="Delete Coupon"
        size="sm"
        footer={
          <>
            <button
              onClick={() =>
                setDeleteModal({ open: false, coupon: null })
              }
              disabled={deleting}
              className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-text-secondary border border-border-light hover:bg-bg-secondary disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-70 transition-colors inline-flex items-center gap-2"
            >
              {deleting && <Loader2 size={14} className="animate-spin" />}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete coupon{" "}
          <span className="font-mono font-bold text-text-primary">
            {deleteModal.coupon?.code}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
