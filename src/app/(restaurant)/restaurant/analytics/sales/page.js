"use client";

import { useEffect } from "react";
import {
  IndianRupee, Percent, Loader2, AlertCircle, Wallet, Tag, HandCoins,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { exportToCsv } from "@/lib/csvExport";
import useRestaurantAnalyticsStore from "@/stores/restaurantAnalyticsStore";
import AnalyticsFilterBar from "@/components/restaurant/analytics/AnalyticsFilterBar";
import { LineChart, Heatmap, KpiCard } from "@/components/analytics/charts";

const ORDER_TYPE_LABELS = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine-in",
  self_service: "Self Service",
};

export default function SalesAnalysis() {
  const { sales, salesLoading, fetchSales, filters, error } = useRestaurantAnalyticsStore();

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const t = sales?.totals;

  const handleExport = () => {
    if (!sales?.dailyTable) return;
    exportToCsv("sales-report", sales.dailyTable.map((d) => ({ Date: d.bucket, Orders: d.orders, Revenue: d.revenue })));
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Analysis</h1>
          <p className="text-sm text-text-secondary mt-0.5">Revenue breakdown, commission & payment splits</p>
        </div>

        <AnalyticsFilterBar onExport={handleExport} exportLabel="Export daily revenue" />

        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
            <AlertCircle size={15} /> Couldn&apos;t load sales analytics.
          </div>
        )}

        {salesLoading && !sales ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="text-[#FF5722] animate-spin" />
          </div>
        ) : t ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Gross Revenue" value={formatPrice(t.gross)} icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-50" sub={`${t.orders} orders`} />
              <KpiCard label="Est. Net Revenue" value={formatPrice(t.estimatedNet)} icon={Wallet} color="text-blue-600" bg="bg-blue-50" sub={`After ${t.commissionPct}% platform commission`} />
              <KpiCard label="Discounts Given" value={formatPrice(t.discountsGiven)} icon={Tag} color="text-red-500" bg="bg-red-50" sub="Coupons + membership" />
              <KpiCard label="Tips Collected" value={formatPrice(t.tips)} icon={HandCoins} color="text-amber-600" bg="bg-amber-50" sub={`Avg ${formatPrice(t.avgDailyRevenue)}/day`} />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] px-4 py-3 flex items-start gap-2">
              <Percent size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">
                Net revenue is an <strong>estimate</strong> using the platform&apos;s current commission rate ({t.commissionPct}%) applied to gross revenue for this period — it isn&apos;t a locked historical figure, since commission isn&apos;t stored per-order.
              </p>
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">Revenue Trend</h2>
              <LineChart data={sales.dailyTable.map((d) => d.revenue)} labels={sales.dailyTable.map((d) => d.bucket)} color="#10B981" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Payment Method Split</h2>
                <SplitBars
                  rows={sales.paymentMethodSplit.map((p) => ({ label: p.method === "cod" ? "Cash on Delivery" : "Online", revenue: p.revenue, orders: p.orders }))}
                  total={t.gross}
                />
              </div>
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Order Type Split</h2>
                <SplitBars
                  rows={sales.orderTypeSplit.map((o) => ({ label: ORDER_TYPE_LABELS[o.orderType] || o.orderType, revenue: o.revenue, orders: o.orders }))}
                  total={t.gross}
                />
              </div>
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-1">Peak Hours</h2>
              <p className="text-xs text-text-secondary mb-4">Order volume by day of week and hour</p>
              <Heatmap cells={sales.heatmap} />
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">Revenue by {sales.granularity === "day" ? "Day" : sales.granularity === "week" ? "Week" : "Month"}</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light">
                      <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Period</th>
                      <th className="text-right text-xs font-semibold text-text-secondary pb-3 pr-4">Orders</th>
                      <th className="text-right text-xs font-semibold text-text-secondary pb-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.dailyTable.map((row) => (
                      <tr key={row.bucket} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                        <td className="py-3 pr-4 text-sm font-medium text-text-primary">{row.bucket}</td>
                        <td className="py-3 pr-4 text-right text-sm text-text-secondary">{row.orders}</td>
                        <td className="py-3 text-right text-sm font-bold text-[#FF5722]">{formatPrice(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SplitBars({ rows, total }) {
  if (!rows || rows.length === 0 || total === 0) {
    return <p className="text-xs text-text-tertiary text-center py-6">No data for this period</p>;
  }
  const colors = ["#2563EB", "#FF5722", "#10B981", "#F59E0B"];
  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const pct = total > 0 ? Math.round((row.revenue / total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary">{row.label}</span>
              <span className="text-xs text-text-secondary">{formatPrice(row.revenue)} · {row.orders} orders ({pct}%)</span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
