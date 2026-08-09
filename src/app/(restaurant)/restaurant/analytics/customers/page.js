"use client";

import { useEffect } from "react";
import { Users, UserPlus, Repeat, ShoppingBag, Loader2, AlertCircle, Crown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { exportToCsv } from "@/lib/csvExport";
import useRestaurantAnalyticsStore from "@/stores/restaurantAnalyticsStore";
import AnalyticsFilterBar from "@/components/restaurant/analytics/AnalyticsFilterBar";
import { KpiCard, NewVsReturningBar } from "@/components/analytics/charts";

export default function CustomerInsights() {
  const { customers, customersLoading, fetchCustomers, filters, error } = useRestaurantAnalyticsStore();

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleExport = () => {
    if (!customers?.topCustomers) return;
    exportToCsv(
      "top-customers",
      customers.topCustomers.map((c) => ({ Name: c.name, Phone: c.phone || "", Orders: c.orders, Spend: c.spend }))
    );
  };

  if (!customers && customersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-[#FF5722] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Insights</h1>
          <p className="text-sm text-text-secondary mt-0.5">New vs returning, repeat rate & top spenders</p>
        </div>

        <AnalyticsFilterBar onExport={handleExport} exportLabel="Export top customers" />

        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
            <AlertCircle size={15} /> Couldn&apos;t load customer analytics.
          </div>
        )}

        {customers && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Customers This Period" value={customers.totalCustomers.toLocaleString("en-IN")} icon={Users} color="text-blue-600" bg="bg-blue-50" />
              <KpiCard label="New Customers" value={customers.newCustomers.toLocaleString("en-IN")} icon={UserPlus} color="text-emerald-600" bg="bg-emerald-50" />
              <KpiCard label="Avg Orders / Customer" value={customers.avgOrdersPerCustomer} icon={ShoppingBag} color="text-purple-600" bg="bg-purple-50" />
              <KpiCard label="All-Time Repeat Rate" value={`${customers.allTimeRepeatRatePct}%`} icon={Repeat} color="text-amber-600" bg="bg-amber-50" sub="Customers with 2+ orders ever" />
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">New vs Returning (this period)</h2>
              <NewVsReturningBar newCount={customers.newCustomers} returningCount={customers.returningCustomers} />
              <p className="text-xs text-text-tertiary mt-3">
                &quot;Returning&quot; means they had a prior order with you before this period started. For a longer-run view, the all-time repeat rate above isn&apos;t affected by which date range you pick.
              </p>
            </div>

            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={15} className="text-amber-500" />
                <h2 className="text-sm font-bold text-text-primary">Top Customers by Spend</h2>
              </div>
              {customers.topCustomers.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-6">No orders in this period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-light">
                        <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">#</th>
                        <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Customer</th>
                        <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Phone</th>
                        <th className="text-right text-xs font-semibold text-text-secondary pb-3 pr-4">Orders</th>
                        <th className="text-right text-xs font-semibold text-text-secondary pb-3">Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.topCustomers.map((c, idx) => (
                        <tr key={idx} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-bg-secondary text-text-secondary"
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm font-semibold text-text-primary">{c.name}</td>
                          <td className="py-3 pr-4 text-xs text-text-secondary">{c.phone || "—"}</td>
                          <td className="py-3 pr-4 text-right text-sm text-text-primary">{c.orders}</td>
                          <td className="py-3 text-right text-sm font-bold text-[#FF5722]">{formatPrice(c.spend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
