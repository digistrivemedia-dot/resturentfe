"use client";

import { useEffect } from "react";
import {
  ShoppingBag, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Users,
} from "lucide-react";
import { exportToCsv } from "@/lib/csvExport";
import useRestaurantAnalyticsStore from "@/stores/restaurantAnalyticsStore";
import AnalyticsFilterBar from "@/components/restaurant/analytics/AnalyticsFilterBar";
import { KpiCard, NewVsReturningBar } from "@/components/analytics/charts";

const STATUS_LABELS = {
  pending_payment: "Pending Payment",
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  delivered: "#10B981",
  cancelled: "#EF4444",
  placed: "#3B82F6",
  confirmed: "#3B82F6",
  preparing: "#F59E0B",
  ready: "#F59E0B",
  picked_up: "#8B5CF6",
  out_for_delivery: "#8B5CF6",
  pending_payment: "#9CA3AF",
};

function formatMinutes(mins) {
  if (mins === null || mins === undefined) return "—";
  if (mins < 60) return `${Math.round(mins)} min`;
  return `${Math.floor(mins / 60)}h ${Math.round(mins % 60)}m`;
}

export default function OrderInsights() {
  const { orders, ordersLoading, fetchOrders, filters, error } = useRestaurantAnalyticsStore();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleExport = () => {
    if (!orders?.cancellationReasons) return;
    exportToCsv("cancellation-reasons", orders.cancellationReasons.map((r) => ({ Reason: r.reason, Count: r.count })));
  };

  if (!orders && ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-[#FF5722] animate-spin" />
      </div>
    );
  }

  const totalOrders = orders?.statusBreakdown.reduce((s, x) => s + x.count, 0) || 0;
  const deliveredCount = orders?.statusBreakdown.find((s) => s.status === "delivered")?.count || 0;
  const cancelledCount = orders?.statusBreakdown.find((s) => s.status === "cancelled")?.count || 0;
  const maxStatusCount = orders ? Math.max(...orders.statusBreakdown.map((s) => s.count), 1) : 1;
  const maxCancelReason = orders?.cancellationReasons?.length
    ? Math.max(...orders.cancellationReasons.map((r) => r.count))
    : 1;

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Order Insights</h1>
          <p className="text-sm text-text-secondary mt-0.5">Order trends, cancellations & preparation times</p>
        </div>

        <AnalyticsFilterBar onExport={handleExport} exportLabel="Export cancellation reasons" />

        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
            <AlertCircle size={15} /> Couldn&apos;t load order analytics.
          </div>
        )}

        {orders && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Total Orders" value={totalOrders.toLocaleString("en-IN")} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" />
              <KpiCard label="Completed" value={deliveredCount.toLocaleString("en-IN")} icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" sub={totalOrders > 0 ? `${Math.round((deliveredCount / totalOrders) * 100)}% of orders` : undefined} />
              <KpiCard label="Cancelled" value={cancelledCount.toLocaleString("en-IN")} icon={XCircle} color="text-red-500" bg="bg-red-50" sub={totalOrders > 0 ? `${Math.round((cancelledCount / totalOrders) * 100)}% of orders` : undefined} />
              <KpiCard label="Avg Prep Time" value={formatMinutes(orders.avgPrepMinutes)} icon={Clock} color="text-amber-600" bg="bg-amber-50" sub={`Fulfillment ${formatMinutes(orders.avgFulfillmentMinutes)}`} />
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">Order Status Breakdown</h2>
              <div className="space-y-2.5">
                {orders.statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-text-secondary w-32 shrink-0">{STATUS_LABELS[s.status] || s.status}</span>
                    <div className="flex-1 h-6 bg-bg-secondary rounded-[var(--radius-sm)] overflow-hidden">
                      <div className="h-full rounded-[var(--radius-sm)] flex items-center justify-end px-2" style={{ width: `${(s.count / maxStatusCount) * 100}%`, backgroundColor: STATUS_COLORS[s.status] || "#94A3B8" }}>
                        <span className="text-[10px] font-bold text-white">{s.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cancellation reasons */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Top Cancellation Reasons</h2>
                {orders.cancellationReasons.length === 0 ? (
                  <p className="text-xs text-text-tertiary text-center py-6">No cancellations in this period</p>
                ) : (
                  <div className="space-y-2.5">
                    {orders.cancellationReasons.map((r) => (
                      <div key={r.reason}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-primary truncate pr-2">{r.reason}</span>
                          <span className="text-xs font-bold text-text-secondary shrink-0">{r.count}</span>
                        </div>
                        <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${(r.count / maxCancelReason) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {orders.cancelledBy.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-light flex gap-4">
                    {orders.cancelledBy.map((c) => (
                      <div key={c.who} className="text-xs text-text-secondary">
                        <span className="font-bold text-text-primary">{c.count}</span> cancelled by <span className="capitalize">{c.who}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduling + customer mix */}
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-text-primary mb-3">Scheduled vs ASAP</h2>
                  <ScheduleBars data={orders.scheduleSplit} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5"><Users size={14} /> New vs Returning</h2>
                  <NewVsReturningBar newCount={orders.newVsReturning.newCustomers} returningCount={orders.newVsReturning.returningCustomers} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScheduleBars({ data }) {
  const asap = data.find((d) => d.type === "asap")?.count || 0;
  const scheduled = data.find((d) => d.type === "scheduled")?.count || 0;
  const total = asap + scheduled;
  if (total === 0) return <p className="text-xs text-text-tertiary">No orders in this period</p>;
  return (
    <div className="flex h-6 rounded-[var(--radius-sm)] overflow-hidden">
      <div className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(asap / total) * 100}%` }}>
        {asap > 0 && `ASAP ${asap}`}
      </div>
      <div className="bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(scheduled / total) * 100}%` }}>
        {scheduled > 0 && `Scheduled ${scheduled}`}
      </div>
    </div>
  );
}
