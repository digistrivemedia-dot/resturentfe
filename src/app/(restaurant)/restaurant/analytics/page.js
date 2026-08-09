"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, IndianRupee, Star, BarChart3, ArrowUpRight,
  ShoppingCart, Package, Users, Loader2, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import useRestaurantAnalyticsStore from "@/stores/restaurantAnalyticsStore";
import AnalyticsFilterBar from "@/components/restaurant/analytics/AnalyticsFilterBar";
import { LineChart, BarChart, KpiCard } from "@/components/analytics/charts";

const NAV_CARDS = [
  { title: "Sales Analysis", desc: "Revenue breakdown, commissions & payment splits", href: "/restaurant/analytics/sales", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Order Insights", desc: "Order trends, cancellations & preparation times", href: "/restaurant/analytics/orders", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Item Performance", desc: "Best sellers, worst sellers & complaint signals", href: "/restaurant/analytics/items", icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  { title: "Customer Insights", desc: "New vs returning, repeat rate & top spenders", href: "/restaurant/analytics/customers", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function AnalyticsOverview() {
  const { overview, overviewLoading, fetchOverview, filters, error } = useRestaurantAnalyticsStore();

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const kpis = overview?.kpis;
  const showCompare = filters.compare;

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics Overview</h1>
          <p className="text-sm text-text-secondary mt-0.5">Track your restaurant&apos;s performance</p>
        </div>

        <AnalyticsFilterBar />

        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
            <AlertCircle size={15} /> Couldn&apos;t load analytics. Try adjusting the filters or reloading.
          </div>
        )}

        {overviewLoading && !overview ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="text-[#FF5722] animate-spin" />
          </div>
        ) : kpis ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Total Revenue" value={formatPrice(kpis.revenue)} icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-50" changePct={showCompare ? kpis.revenueChangePct : null} sub="vs previous period" />
              <KpiCard label="Total Orders" value={kpis.orders.toLocaleString("en-IN")} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" changePct={showCompare ? kpis.ordersChangePct : null} sub="vs previous period" />
              <KpiCard label="Avg Order Value" value={formatPrice(kpis.aov)} icon={BarChart3} color="text-purple-600" bg="bg-purple-50" sub={`${kpis.cancellationRatePct}% cancellation rate`} />
              <KpiCard label="Customer Rating" value={kpis.ratingCount > 0 ? `${kpis.rating} ★` : "No ratings yet"} icon={Star} color="text-amber-600" bg="bg-amber-50" sub={`Based on ${kpis.ratingCount} reviews`} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Revenue Trend</h2>
                <LineChart data={overview.trend.map((t) => t.revenue)} labels={overview.trend.map((t) => t.bucket)} />
              </div>
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Orders Trend</h2>
                <BarChart data={overview.trend.map((t) => t.orders)} labels={overview.trend.map((t) => t.bucket)} />
              </div>
            </div>

            {/* Quick Nav Cards */}
            <div>
              <h2 className="text-sm font-bold text-text-primary mb-3">Detailed Reports</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {NAV_CARDS.map((card) => (
                  <Link key={card.href} href={card.href} className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 flex items-center gap-4 hover:shadow-md hover:border-[#FF5722]/30 transition-all group">
                    <div className={`w-11 h-11 rounded-[var(--radius-lg)] ${card.bg} flex items-center justify-center flex-shrink-0`}>
                      <card.icon size={20} className={card.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-primary group-hover:text-[#FF5722] transition-colors">{card.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{card.desc}</p>
                    </div>
                    <ArrowUpRight size={16} className="text-text-secondary group-hover:text-[#FF5722] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Top / Bottom Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Top Sellers</h2>
                <ItemMiniTable items={overview.topItems} />
              </div>
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Not Selling Well</h2>
                <ItemMiniTable items={overview.bottomItems} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ItemMiniTable({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-text-tertiary text-center py-6">No item sales in this period</p>;
  }
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-light">
          <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Item</th>
          <th className="text-right text-xs font-semibold text-text-secondary pb-3 pr-4">Qty</th>
          <th className="text-right text-xs font-semibold text-text-secondary pb-3">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.menuItem} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
            <td className="py-2.5 pr-4 text-sm font-semibold text-text-primary">{item.name}</td>
            <td className="py-2.5 pr-4 text-right text-sm font-bold text-text-primary">{item.qty}</td>
            <td className="py-2.5 text-right text-sm font-bold text-[#FF5722]">{formatPrice(item.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
