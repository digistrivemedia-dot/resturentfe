"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Star,
  Download,
  ChevronLeft,
  ChevronRight,
  Store,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import useAdminRestaurantStore from "@/stores/adminRestaurantStore";

const PAGE_SIZE = 10;

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-success-light", text: "text-success-dark" },
  pending: { label: "Pending", bg: "bg-warning-light", text: "text-warning" },
  suspended: { label: "Suspended", bg: "bg-error-light", text: "text-error" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function ActionButton({ status, restaurantId, onVerify, onSuspend, onReactivate }) {
  if (status === "pending") {
    return (
      <button
        onClick={() => onVerify(restaurantId)}
        className="text-xs px-2.5 py-1 rounded-[var(--radius-md)] bg-success-light text-success-dark hover:bg-success hover:text-white transition-colors font-medium cursor-pointer"
      >
        Approve
      </button>
    );
  }
  if (status === "active") {
    return (
      <button
        onClick={() => onSuspend(restaurantId)}
        className="text-xs px-2.5 py-1 rounded-[var(--radius-md)] bg-error-light text-error hover:bg-error hover:text-white transition-colors font-medium cursor-pointer"
      >
        Suspend
      </button>
    );
  }
  if (status === "suspended") {
    return (
      <button
        onClick={() => onReactivate(restaurantId)}
        className="text-xs px-2.5 py-1 rounded-[var(--radius-md)] bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors font-medium cursor-pointer"
      >
        Reactivate
      </button>
    );
  }
  return null;
}

export default function RestaurantsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const {
    restaurants,
    pagination,
    isLoading,
    fetchRestaurants,
    verifyRestaurant,
    suspendRestaurant,
  } = useAdminRestaurantStore();

  const loadRestaurants = useCallback(() => {
    const params = {
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };
    try {
      fetchRestaurants(params);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    }
  }, [page, search, statusFilter, fetchRestaurants]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  // Derive stats from current page — or use pagination counts if available
  const stats = {
    total: pagination?.total ?? restaurants.length,
    active: restaurants.filter((r) => r.status === "active").length,
    pending: restaurants.filter((r) => r.status === "pending").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
  };

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleStatusFilter(s) {
    setStatusFilter(s);
    setPage(1);
  }

  async function handleVerify(id) {
    try {
      await verifyRestaurant(id);
      loadRestaurants();
    } catch (err) {
      console.error("Failed to verify restaurant:", err);
    }
  }

  async function handleSuspend(id) {
    const reason = window.prompt("Enter suspension reason (optional):");
    try {
      await suspendRestaurant(id, reason || "");
      loadRestaurants();
    } catch (err) {
      console.error("Failed to suspend restaurant:", err);
    }
  }

  async function handleReactivate(id) {
    try {
      await verifyRestaurant(id);
      loadRestaurants();
    } catch (err) {
      console.error("Failed to reactivate restaurant:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Restaurants</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage and monitor all restaurant partners
          </p>
        </div>
        <Link
          href="/admin/restaurants/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)]"
        >
          <Plus size={16} />
          Onboard New Restaurant
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-text-primary", bg: "bg-bg-primary" },
          { label: "Active", value: stats.active, color: "text-success-dark", bg: "bg-success-light" },
          { label: "Pending", value: stats.pending, color: "text-warning", bg: "bg-warning-light" },
          { label: "Suspended", value: stats.suspended, color: "text-error", bg: "bg-error-light" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-primary rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-sm)] border border-border-light"
          >
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by name, city, owner..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-sm bg-bg-secondary border border-border-default rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["all", "active", "pending", "suspended"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    statusFilter === s
                      ? "bg-primary text-white shadow-[var(--shadow-sm)]"
                      : "bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <button
            onClick={() => alert("Exported!")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-hover transition-colors cursor-pointer"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Name / City</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Cuisines</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Commission</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">
                    <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-50" />
                    <p className="text-sm">Loading restaurants...</p>
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">
                    <Store size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No restaurants match your filters</p>
                  </td>
                </tr>
              ) : (
                restaurants.map((r, idx) => (
                  <tr key={r._id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3.5 text-text-tertiary text-xs">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/restaurants/${r._id}`}
                        className="font-semibold text-text-primary hover:text-primary transition-colors"
                      >
                        {r.name}
                      </Link>
                      <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {r.address?.area ? `${r.address.area}, ` : ""}{r.address?.city || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-text-primary font-medium">{r.owner?.name || "—"}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">{r.owner?.email || ""}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(r.cuisines || []).slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 bg-primary-50 text-primary text-xs rounded-[var(--radius-full)] font-medium"
                          >
                            {c}
                          </span>
                        ))}
                        {(r.cuisines || []).length > 2 && (
                          <span className="px-2 py-0.5 bg-bg-secondary text-text-tertiary text-xs rounded-[var(--radius-full)] font-medium">
                            +{r.cuisines.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {r.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-text-primary font-semibold">
                          <Star size={13} className="text-warning fill-warning" />
                          {r.rating}
                        </span>
                      ) : (
                        <span className="text-xs text-text-tertiary italic">New</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-text-primary font-medium">
                      {r.commission != null ? `${r.commission}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/restaurants/${r._id}`}
                          className="text-xs px-2.5 py-1 rounded-[var(--radius-md)] bg-bg-secondary text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors font-medium"
                        >
                          View
                        </Link>
                        <ActionButton
                          status={r.status}
                          restaurantId={r._id}
                          onVerify={handleVerify}
                          onSuspend={handleSuspend}
                          onReactivate={handleReactivate}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-light bg-bg-secondary">
            <p className="text-xs text-text-secondary">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} restaurants
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-[var(--radius-md)] font-medium transition-colors cursor-pointer ${
                    page === p
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-8 text-center text-text-tertiary">
            <Loader2 size={28} className="mx-auto mb-2 animate-spin opacity-50" />
            <p className="text-sm">Loading restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-8 text-center text-text-tertiary">
            <Store size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No restaurants match your filters</p>
          </div>
        ) : (
          restaurants.map((r) => (
            <div
              key={r._id}
              className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/restaurants/${r._id}`}
                    className="font-semibold text-text-primary hover:text-primary transition-colors"
                  >
                    {r.name}
                  </Link>
                  <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />
                    {r.address?.area ? `${r.address.area}, ` : ""}{r.address?.city || ""}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <User size={12} className="text-text-tertiary" />
                    <span className="text-xs text-text-secondary">{r.owner?.name || "—"}</span>
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light">
                {r.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-primary">
                    <Star size={13} className="text-warning fill-warning" />
                    {r.rating}
                  </span>
                ) : (
                  <span className="text-xs text-text-tertiary italic">New</span>
                )}
                <span className="text-xs text-text-secondary">
                  {r.commission != null ? `${r.commission}% commission` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Link
                  href={`/admin/restaurants/${r._id}`}
                  className="text-xs px-3 py-1.5 rounded-[var(--radius-md)] bg-bg-secondary text-text-secondary hover:bg-bg-hover transition-colors font-medium"
                >
                  View
                </Link>
                <ActionButton
                  status={r.status}
                  restaurantId={r._id}
                  onVerify={handleVerify}
                  onSuspend={handleSuspend}
                  onReactivate={handleReactivate}
                />
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-text-secondary">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
