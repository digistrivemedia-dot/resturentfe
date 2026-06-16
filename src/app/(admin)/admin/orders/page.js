"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  ShoppingBag,
  Zap,
  IndianRupee,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Clock,
} from "lucide-react";
import { Modal, Badge } from "@/components/ui";
import { formatPrice, timeAgo } from "@/lib/utils";
import useAdminOrderStore from "@/stores/adminOrderStore";

const LIVE_STATUSES = ["placed", "confirmed", "preparing", "out_for_delivery"];

const STATUS_CONFIG = {
  placed:           { label: "Placed",           variant: "primary" },
  confirmed:        { label: "Confirmed",        variant: "primary" },
  preparing:        { label: "Preparing",        variant: "warning" },
  out_for_delivery: { label: "Out for Delivery", variant: "primary" },
  delivered:        { label: "Delivered",        variant: "success" },
  cancelled:        { label: "Cancelled",        variant: "error" },
};

const PAYMENT_METHOD_CONFIG = {
  online: { label: "Online", className: "bg-primary-50 text-primary" },
  cod:    { label: "COD",    className: "bg-warning-light text-warning-dark" },
  wallet: { label: "Wallet", className: "bg-success-light text-success-dark" },
};

const PAYMENT_STATUS_CONFIG = {
  paid:     { label: "Paid",     className: "text-success" },
  pending:  { label: "Pending",  className: "text-warning-dark" },
  refunded: { label: "Refunded", className: "text-error" },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function canRefund(order) {
  return order.status === "delivered" && order.paymentStatus === "paid";
}

function getOrderCustomer(order) {
  return typeof order.customer === "object" ? order.customer?.name : order.customer;
}

function getOrderRestaurant(order) {
  return typeof order.restaurant === "object" ? order.restaurant?.name : order.restaurant;
}

function getOrderItems(order) {
  if (Array.isArray(order.items)) return order.items.length;
  return order.items ?? 0;
}

function getOrderTotal(order) {
  return order.pricing?.total ?? order.total ?? 0;
}

function handleExportCSV(orders) {
  const header = "Order #,Customer,Restaurant,Items,Total,Payment Method,Payment Status,Status,Created At";
  const rows = orders.map((o) =>
    [
      o.orderNumber,
      getOrderCustomer(o),
      getOrderRestaurant(o),
      getOrderItems(o),
      getOrderTotal(o),
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.createdAt,
    ].join(",")
  );
  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── sub-components ────────────────────────────────────────────────────────────

function PaymentCell({ paymentMethod, paymentStatus }) {
  const method = PAYMENT_METHOD_CONFIG[paymentMethod] ?? { label: paymentMethod, className: "bg-bg-secondary text-text-secondary" };
  const pstat  = PAYMENT_STATUS_CONFIG[paymentStatus] ?? { label: paymentStatus, className: "text-text-tertiary" };
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`self-start inline-flex items-center h-5 px-2 text-xs font-semibold rounded-[var(--radius-full)] ${method.className}`}>
        {method.label}
      </span>
      <span className={`text-xs font-medium ${pstat.className}`}>{pstat.label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { orders, pagination, isLoading, isSaving, fetchOrders, processRefund } = useAdminOrderStore();

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]                 = useState(1);
  const [refundOrder, setRefundOrder]   = useState(null);
  const [refundReason, setRefundReason] = useState("");

  // Build params and fetch whenever filters/page changes
  useEffect(() => {
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter === "live")      params.status = LIVE_STATUSES.join(",");
    else if (statusFilter === "delivered") params.status = "delivered";
    else if (statusFilter === "cancelled") params.status = "cancelled";

    try {
      fetchOrders(params);
    } catch (_) {}
  }, [search, statusFilter, page]);

  // Debounce search reset
  function handleSearchChange(val) {
    setSearch(val);
    setPage(1);
  }

  // ── derived stats from current page of orders ──
  const totalLive      = orders.filter((o) => LIVE_STATUSES.includes(o.status)).length;
  const totalRevenue   = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + getOrderTotal(o), 0);
  const totalCancelled = orders.filter((o) => o.status === "cancelled").length;

  const totalPages  = pagination.pages ?? 1;
  const currentPage = page;

  // ── refund ──
  function openRefund(order) {
    setRefundOrder(order);
    setRefundReason("");
  }

  function closeRefund() {
    if (!isSaving) { setRefundOrder(null); setRefundReason(""); }
  }

  async function handleProcessRefund() {
    if (!refundOrder || isSaving) return;
    try {
      await processRefund(refundOrder._id, { reason: refundReason });
      setRefundOrder(null);
      setRefundReason("");
    } catch (_) {}
  }

  // ── stat chips ──
  const chips = [
    {
      label: "Total Orders",
      value: pagination.total ?? orders.length,
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      label: "Live Orders",
      value: totalLive,
      icon: Zap,
      color: "text-success",
      bg: "bg-success-light",
      pulse: true,
    },
    {
      label: "Revenue",
      value: formatPrice(totalRevenue),
      icon: IndianRupee,
      color: "text-warning-dark",
      bg: "bg-warning-light",
    },
    {
      label: "Cancelled",
      value: totalCancelled,
      icon: XCircle,
      color: "text-error",
      bg: "bg-error-light",
    },
  ];

  const selectClass =
    "h-9 px-3 pr-8 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none";
  const chevronBg = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "16px",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Order Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Monitor and manage all platform orders in real time
          </p>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3"
            >
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${chip.bg}`}>
                {chip.pulse ? (
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-4 h-4 rounded-full bg-success opacity-30 animate-ping" />
                    <Icon size={18} className={chip.color} />
                  </span>
                ) : (
                  <Icon size={18} className={chip.color} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-text-primary leading-tight">{chip.value}</p>
                <p className="text-xs text-text-tertiary truncate">{chip.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search order #, customer, restaurant..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-[var(--radius-md)]">
          {[
            { key: "all",       label: "All" },
            { key: "live",      label: "Live" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => { setStatusFilter(s.key); setPage(1); }}
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

        {/* Export */}
        <button
          onClick={() => handleExportCSV(orders)}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover transition-colors cursor-pointer shrink-0"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                {["Order #", "Customer", "Restaurant", "Items", "Total", "Payment", "Status", "Time", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-text-tertiary">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-text-tertiary">
                    No orders found matching your filters.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-bg-hover transition-colors">
                    {/* Order # */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-text-primary">{getOrderCustomer(order)}</span>
                    </td>

                    {/* Restaurant */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-text-secondary">{getOrderRestaurant(order)}</span>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                      {getOrderItems(order)} item{getOrderItems(order) !== 1 ? "s" : ""}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-text-primary">
                      {formatPrice(getOrderTotal(order))}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3">
                      <PaymentCell paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs text-text-tertiary flex items-center gap-1">
                        <Clock size={11} />
                        {timeAgo(order.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                        {canRefund(order) && (
                          <button
                            onClick={() => openRefund(order)}
                            className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-error-light text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-12 text-center text-sm text-text-tertiary">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-12 text-center text-sm text-text-tertiary">
            No orders found matching your filters.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white border border-border-light rounded-[var(--radius-xl)] p-4 space-y-3">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-mono text-xs font-semibold text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="font-bold text-text-primary text-sm mt-0.5">{getOrderCustomer(order)}</p>
                  <p className="text-xs text-text-secondary">{getOrderRestaurant(order)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-text-tertiary">Items</p>
                  <p className="text-text-primary font-medium mt-0.5">{getOrderItems(order)} item{getOrderItems(order) !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Total</p>
                  <p className="text-text-primary font-bold mt-0.5">{formatPrice(getOrderTotal(order))}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Payment</p>
                  <div className="mt-0.5">
                    <PaymentCell paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-text-tertiary">Time</p>
                  <p className="text-text-primary font-medium mt-0.5">{timeAgo(order.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border-light">
                <Link
                  href={`/admin/orders/${order._id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Eye size={13} />
                  View
                </Link>
                {canRefund(order) && (
                  <button
                    onClick={() => openRefund(order)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] bg-error-light text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Refund
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-text-tertiary">
            Showing {Math.min((currentPage - 1) * 20 + 1, pagination.total)}–{Math.min(currentPage * 20, pagination.total)} of {pagination.total} orders
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

      {/* ── Refund Modal ── */}
      <Modal
        isOpen={!!refundOrder}
        onClose={closeRefund}
        title="Process Refund"
        size="sm"
        footer={
          <>
            <button
              onClick={closeRefund}
              disabled={isSaving}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessRefund}
              disabled={isSaving || !refundReason.trim()}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-error text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {isSaving ? "Processing..." : "Process Refund"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Order summary */}
          <div className="bg-bg-secondary rounded-[var(--radius-lg)] p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Order #</span>
              <span className="font-mono font-semibold text-primary">{refundOrder?.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Customer</span>
              <span className="font-semibold text-text-primary">{refundOrder ? getOrderCustomer(refundOrder) : ""}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Amount</span>
              <span className="font-bold text-text-primary">{formatPrice(refundOrder ? getOrderTotal(refundOrder) : 0)}</span>
            </div>
          </div>

          {/* Reason textarea */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">
              Refund Reason <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter reason for refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
