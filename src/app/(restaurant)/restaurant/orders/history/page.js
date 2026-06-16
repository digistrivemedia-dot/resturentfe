"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";
import useRestaurantDashboardStore from "@/stores/restaurantDashboardStore";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-IN", { month: "short" });
  const time = d.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day} ${month}, ${time}`;
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function itemsSummary(items) {
  if (!items || items.length === 0) return "—";
  const first = items[0].name;
  const rest = items.length - 1;
  return rest > 0 ? `${first} +${rest} more` : first;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "delivered") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
        style={{
          backgroundColor: "var(--success-light)",
          color: "var(--success-dark)",
          borderRadius: "var(--radius-full)",
        }}
      >
        <CheckCircle2 size={11} />
        Delivered
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full"
      style={{
        backgroundColor: "var(--error-light)",
        color: "var(--error-dark)",
        borderRadius: "var(--radius-full)",
      }}
    >
      <XCircle size={11} />
      Cancelled
    </span>
  );
}

function PaymentBadge({ method, paymentStatus }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="inline-flex items-center px-2 py-0.5 text-xs font-medium w-fit"
        style={{
          backgroundColor: method === "online" ? "var(--info-light)" : "var(--warning-light)",
          color: method === "online" ? "var(--info-dark)" : "var(--warning-dark)",
          borderRadius: "var(--radius-full)",
        }}
      >
        {method === "online" ? "Online" : "COD"}
      </span>
      <span
        className="text-xs"
        style={{
          color: paymentStatus === "paid" ? "var(--success-dark)" : "var(--error-dark)",
        }}
      >
        {paymentStatus === "paid" ? "Paid" : "Refunded"}
      </span>
    </div>
  );
}

function PillFilter({ options, value, onChange }) {
  return (
    <div
      className="flex items-center gap-1 p-1"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border-light)",
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 py-1 text-sm font-medium transition-all duration-150"
            style={{
              borderRadius: "var(--radius-full)",
              backgroundColor: active ? "var(--primary)" : "transparent",
              color: active ? "#fff" : "var(--text-secondary)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderHistoryPage() {
  const { orderHistory, pagination, isLoading, fetchOrderHistory } =
    useRestaurantDashboardStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch whenever filters or page change
  const loadHistory = useCallback(() => {
    const params = { page };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentFilter !== "all") params.paymentMethod = paymentFilter;
    fetchOrderHistory(params);
  }, [search, statusFilter, paymentFilter, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Stats derived from current page data (API provides totals via pagination) ──
  const totalOrders = pagination.total || 0;
  const deliveredCount = orderHistory.filter((o) => o.status === "delivered").length;
  const cancelledCount = orderHistory.filter((o) => o.status === "cancelled").length;
  const totalRevenue = orderHistory
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const totalPages = pagination.pages || 1;
  const safePage = Math.min(page, totalPages);

  // Display range
  const limit = pagination.limit || 20;
  const startIdx = (safePage - 1) * limit;
  const endIdx = Math.min(startIdx + orderHistory.length, pagination.total || 0);

  function handleFilterChange(setter) {
    return (val) => {
      setter(val);
      setPage(1);
    };
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleExport() {
    alert("Exported!");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/restaurant/orders"
          className="flex items-center justify-center w-9 h-9 transition-colors"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-secondary)",
          }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Order History
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            All past orders for your restaurant
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div
          className="flex items-center gap-3 p-4"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 shrink-0"
            style={{
              backgroundColor: "var(--primary-50)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <ShoppingBag size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {totalOrders}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Total Orders
            </p>
          </div>
        </div>

        {/* Delivered */}
        <div
          className="flex items-center gap-3 p-4"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 shrink-0"
            style={{
              backgroundColor: "var(--success-light)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <CheckCircle2 size={18} style={{ color: "var(--success-dark)" }} />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--success-dark)" }}>
              {deliveredCount}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Delivered
            </p>
          </div>
        </div>

        {/* Cancelled */}
        <div
          className="flex items-center gap-3 p-4"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 shrink-0"
            style={{
              backgroundColor: "var(--error-light)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <XCircle size={18} style={{ color: "var(--error-dark)" }} />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--error-dark)" }}>
              {cancelledCount}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Cancelled
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div
          className="flex items-center gap-3 p-4"
          style={{
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 shrink-0"
            style={{
              backgroundColor: "var(--primary-50)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <IndianRupee size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Total Revenue
            </p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div
        className="p-4"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              placeholder="Search order # or customer name..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-sm outline-none transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-focus)";
                e.target.style.backgroundColor = "var(--bg-primary)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-light)";
                e.target.style.backgroundColor = "var(--bg-secondary)";
              }}
            />
          </div>

          {/* Status filter */}
          <PillFilter
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            options={[
              { label: "All", value: "all" },
              { label: "Delivered", value: "delivered" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />

          {/* Payment filter */}
          <PillFilter
            value={paymentFilter}
            onChange={handleFilterChange(setPaymentFilter)}
            options={[
              { label: "All", value: "all" },
              { label: "Online", value: "online" },
              { label: "COD", value: "cod" },
            ]}
          />

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium shrink-0 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        {/* ── Desktop table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                      style={{
                        color: "var(--text-secondary)",
                        borderBottom: "1px solid var(--border-light)",
                        position: col === "Order #" || col === "Status" ? "relative" : undefined,
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : orderHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    No orders match your filters.
                  </td>
                </tr>
              ) : (
                orderHistory.map((order, idx) => {
                  const isEven = idx % 2 === 1;
                  return (
                    <tr
                      key={order._id}
                      className="group transition-colors"
                      style={{
                        backgroundColor: isEven
                          ? "color-mix(in srgb, var(--bg-secondary) 30%, transparent)"
                          : "var(--bg-primary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isEven
                          ? "color-mix(in srgb, var(--bg-secondary) 30%, transparent)"
                          : "var(--bg-primary)";
                      }}
                    >
                      {/* Order # */}
                      <td
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <Link
                          href={`/restaurant/orders/${order._id}`}
                          className="font-mono text-xs font-semibold hover:underline"
                          style={{ color: "var(--primary)" }}
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {order.customer.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {order.customer.phone}
                        </p>
                      </td>

                      {/* Items */}
                      <td
                        className="px-4 py-3 max-w-[180px]"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <p
                          className="truncate text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {itemsSummary(order.items)}
                        </p>
                      </td>

                      {/* Total */}
                      <td
                        className="px-4 py-3 font-bold"
                        style={{
                          borderBottom: "1px solid var(--border-light)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {formatCurrency(order.pricing?.total)}
                      </td>

                      {/* Payment */}
                      <td
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <PaymentBadge
                          method={order.paymentMethod}
                          paymentStatus={order.paymentStatus}
                        />
                      </td>

                      {/* Status */}
                      <td
                        className="px-4 py-3"
                        style={{ borderBottom: "1px solid var(--border-light)" }}
                      >
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Date */}
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm"
                        style={{
                          borderBottom: "1px solid var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden divide-y" style={{ borderColor: "var(--border-light)" }}>
          {isLoading ? (
            <p
              className="px-4 py-10 text-center text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Loading orders…
            </p>
          ) : orderHistory.length === 0 ? (
            <p
              className="px-4 py-10 text-center text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              No orders match your filters.
            </p>
          ) : (
            orderHistory.map((order) => (
              <div key={order._id} className="p-4 space-y-3">
                {/* Top row: order # + status */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/restaurant/orders/${order._id}`}
                    className="font-mono text-xs font-semibold hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {order.orderNumber}
                  </Link>
                  <StatusBadge status={order.status} />
                </div>

                {/* Customer */}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {order.customer.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {order.customer.phone}
                  </p>
                </div>

                {/* Items */}
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {itemsSummary(order.items)}
                </p>

                {/* Bottom row: total + payment + date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(order.pricing?.total)}
                  </p>
                  <PaymentBadge
                    method={order.paymentMethod}
                    paymentStatus={order.paymentStatus}
                  />
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3"
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          {/* Showing X–Y of Z */}
          <p className="text-sm order-2 sm:order-1" style={{ color: "var(--text-secondary)" }}>
            {pagination.total === 0
              ? "0 orders"
              : `Showing ${startIdx + 1}–${endIdx} of ${pagination.total} order${
                  pagination.total !== 1 ? "s" : ""
                }`}
          </p>

          {/* Controls */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium disabled:opacity-40 transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-secondary)",
              }}
            >
              <ChevronLeft size={15} />
              Prev
            </button>

            <span
              className="px-3 py-1.5 text-sm font-semibold"
              style={{
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary-50)",
                color: "var(--primary)",
              }}
            >
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium disabled:opacity-40 transition-colors"
              style={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-secondary)",
              }}
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
