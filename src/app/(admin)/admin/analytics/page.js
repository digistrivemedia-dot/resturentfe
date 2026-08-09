"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, ShoppingBag, IndianRupee, Store, Users, Star, AlertCircle,
  Loader2, MapPin, Trophy, Crown, UserPlus, Repeat, MessageSquareWarning,
  Bike, Clock, CheckCircle2, Download,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { exportToCsv } from "@/lib/csvExport";
import useAdminAnalyticsStore from "@/stores/adminAnalyticsStore";
import AnalyticsFilterBar from "@/components/admin/analytics/AnalyticsFilterBar";
import { LineChart, BarChart, KpiCard, NewVsReturningBar } from "@/components/analytics/charts";
import { SearchInput } from "@/components/ui";

const ORDER_TYPE_LABELS = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine-in",
  self_service: "Self Service",
};

function SplitBars({ rows, total, colors = ["#2563EB", "#FF5722", "#10B981", "#F59E0B"] }) {
  if (!rows || rows.length === 0 || total === 0) {
    return <p className="text-xs text-text-tertiary text-center py-6">No data for this period</p>;
  }
  return (
    <div className="space-y-3">
      {rows.map((row, i) => {
        const pct = total > 0 ? Math.round((row.gmv / total) * 100) : 0;
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary">{row.label}</span>
              <span className="text-xs text-text-secondary">{formatPrice(row.gmv)} · {row.orders} orders ({pct}%)</span>
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

export default function PlatformAnalytics() {
  const router = useRouter();
  const { overview, cities, restaurants, customers, orderMix, supportHealth, deliveryHealth, isLoading, filters, fetchAll, error } = useAdminAnalyticsStore();
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [restaurantSort, setRestaurantSort] = useState("gmv"); // gmv | orders

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const sortedRestaurants = useMemo(() => {
    if (!restaurants?.restaurants) return [];
    return [...restaurants.restaurants].sort((a, b) => b[restaurantSort] - a[restaurantSort]);
  }, [restaurants, restaurantSort]);

  const visibleRestaurants = useMemo(() => {
    if (!restaurantSearch.trim()) return sortedRestaurants;
    const q = restaurantSearch.trim().toLowerCase();
    return sortedRestaurants.filter((r) => r.name.toLowerCase().includes(q) || (r.city || "").toLowerCase().includes(q));
  }, [sortedRestaurants, restaurantSearch]);

  const bottomRestaurants = useMemo(() => {
    if (!restaurants?.restaurants) return [];
    // Leaderboard already only contains approved restaurants — no status filter needed here
    return [...restaurants.restaurants].sort((a, b) => a.gmv - b.gmv).slice(0, 8);
  }, [restaurants]);

  const kpis = overview?.kpis;
  const showCompare = filters.compare;

  const handleExportCities = () => {
    if (!cities?.cities) return;
    exportToCsv("city-breakdown", cities.cities.map((c) => ({ City: c.city, GMV: c.gmv, Orders: c.orders, Restaurants: c.restaurants, Customers: c.customers, "Share %": c.sharePct })));
  };

  const handleExportRestaurants = () => {
    if (!restaurants?.restaurants) return;
    exportToCsv("restaurant-leaderboard", restaurants.restaurants.map((r) => ({ Restaurant: r.name, City: r.city, GMV: r.gmv, Orders: r.orders, Rating: r.rating })));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Platform Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">Growth, revenue, restaurants, customers & operational health across the whole platform</p>
      </div>

      <AnalyticsFilterBar />

      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
          <AlertCircle size={15} /> Couldn&apos;t load analytics. Try adjusting the filters or reloading.
        </div>
      )}

      {isLoading && !overview ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      ) : kpis ? (
        <>
          {/* Primary KPIs */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="GMV" value={formatPrice(kpis.gmv)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" changePct={showCompare ? kpis.gmvChangePct : null} sub="Gross merchandise value" />
            <KpiCard label="Total Orders" value={kpis.orders.toLocaleString("en-IN")} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" changePct={showCompare ? kpis.ordersChangePct : null} sub={`AOV ${formatPrice(kpis.aov)}`} />
            <KpiCard label="Platform Revenue" value={formatPrice(kpis.platformRevenue)} icon={IndianRupee} color="text-primary" bg="bg-primary-50" sub={`Commission + fees, ${kpis.commissionPct}% rate`} />
            <KpiCard label="Active Restaurants" value={kpis.activeRestaurants.toLocaleString("en-IN")} icon={Store} color="text-purple-600" bg="bg-purple-50" sub="Approved & live on the platform" />
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="Cancellation Rate" value={`${kpis.cancellationRatePct}%`} icon={AlertCircle} color="text-red-500" bg="bg-red-50" />
            <KpiCard label="Avg Rating" value={kpis.ratingCount > 0 ? `${kpis.rating} ★` : "No ratings yet"} icon={Star} color="text-amber-600" bg="bg-amber-50" sub={`${kpis.ratingCount} rated orders`} />
            <KpiCard label="New Restaurants" value={kpis.newRestaurants.toLocaleString("en-IN")} icon={Store} color="text-indigo-600" bg="bg-indigo-50" sub="Signed up this period" />
            <KpiCard label="Active Members" value={customers?.activeMembers?.toLocaleString("en-IN") ?? "—"} icon={Crown} color="text-amber-600" bg="bg-amber-50" sub={customers ? formatPrice(customers.membershipRevenueThisPeriod) + " this period" : undefined} />
          </div>

          {/* Revenue breakdown note */}
          <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] px-4 py-3 text-xs text-amber-800">
            Platform revenue is <strong>estimated</strong>: commission ({kpis.commissionPct}%) applied to food subtotal (₹{formatPrice(kpis.commissionEarned)}) plus platform fees actually collected (₹{formatPrice(kpis.platformFeesCollected)}). It excludes delivery fees, tax, and tips, which pass through to riders/government/riders.
          </div>

          {/* GMV + Orders trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">GMV Trend</h2>
              <LineChart data={overview.trend.map((t) => t.gmv)} labels={overview.trend.map((t) => t.bucket)} color="#10B981" />
            </div>
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">Order Volume Trend</h2>
              <BarChart data={overview.trend.map((t) => t.orders)} labels={overview.trend.map((t) => t.bucket)} />
            </div>
          </div>

          {/* City breakdown */}
          <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5"><MapPin size={15} /> City-wise Breakdown</h2>
                <p className="text-xs text-text-tertiary mt-0.5">Sorted by GMV, for the selected period</p>
              </div>
              <button onClick={handleExportCities} className="flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors">
                <Download size={13} /> Export
              </button>
            </div>
            {!cities || cities.cities.length === 0 ? (
              <p className="text-xs text-text-tertiary text-center py-10">No orders in this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border-light bg-bg-secondary">
                      {["City", "Orders", "GMV", "Restaurants", "Customers", "Market Share"].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {cities.cities.map((c) => (
                      <tr key={c.city} className="hover:bg-bg-hover transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">{c.city}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{c.orders.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">{formatPrice(c.gmv)}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{c.restaurants}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{c.customers.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 whitespace-nowrap w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-bg-secondary rounded-full h-2 overflow-hidden">
                              <div className="h-2 rounded-full bg-primary" style={{ width: `${c.sharePct}%`, opacity: 0.85 }} />
                            </div>
                            <span className="text-xs font-bold text-text-primary w-10 text-right shrink-0">{c.sharePct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Restaurant leaderboard */}
          <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-text-primary flex items-center gap-1.5"><Trophy size={15} /> Restaurant Leaderboard ({visibleRestaurants.length})</h2>
                <p className="text-xs text-text-tertiary mt-0.5">Ranked by {restaurantSort === "gmv" ? "GMV" : "orders"} — includes restaurants with zero orders this period</p>
              </div>
              <div className="flex items-center gap-2">
                <SearchInput value={restaurantSearch} onChange={setRestaurantSearch} onClear={() => setRestaurantSearch("")} placeholder="Search restaurants…" className="w-48" />
                <div className="flex bg-bg-secondary rounded-[var(--radius-md)] p-0.5">
                  {["gmv", "orders"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRestaurantSort(s)}
                      className={`px-3 h-8 text-xs font-bold rounded-[var(--radius-sm)] transition-colors capitalize ${restaurantSort === s ? "bg-white text-primary shadow-sm" : "text-text-secondary"}`}
                    >
                      {s === "gmv" ? "GMV" : "Orders"}
                    </button>
                  ))}
                </div>
                <button onClick={handleExportRestaurants} className="flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors">
                  <Download size={13} /> Export
                </button>
              </div>
            </div>
            {visibleRestaurants.length === 0 ? (
              <p className="text-xs text-text-tertiary text-center py-10">No restaurants match</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border-light bg-bg-secondary">
                      {["Rank", "Restaurant", "Orders", "GMV", "Rating"].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {visibleRestaurants.slice(0, 25).map((r, idx) => (
                      <tr
                        key={r.restaurantId}
                        onClick={() => router.push(`/admin/analytics/${r.restaurantId}`)}
                        className="hover:bg-bg-hover transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : idx === 2 ? "bg-orange-100 text-orange-700" : "bg-bg-secondary text-text-secondary"
                          }`}>{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm font-semibold text-primary hover:underline">{r.name}</p>
                          <p className="text-xs text-text-tertiary">{r.city}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{r.orders.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">{formatPrice(r.gmv)}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{r.rating > 0 ? `${r.rating} ★ (${r.reviewCount})` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Struggling restaurants callout */}
          {bottomRestaurants.length > 0 && (
            <section className="bg-white rounded-[var(--radius-xl)] border border-red-200 p-5">
              <h2 className="text-sm font-bold text-text-primary mb-1">Lowest-GMV Active Restaurants</h2>
              <p className="text-xs text-text-secondary mb-4">Active restaurants generating the least revenue this period — candidates for outreach or support.</p>
              <div className="flex flex-wrap gap-2">
                {bottomRestaurants.map((r) => (
                  <button
                    key={r.restaurantId}
                    onClick={() => router.push(`/admin/analytics/${r.restaurantId}`)}
                    className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-full hover:bg-red-100 transition-colors"
                  >
                    {r.name} <span className="text-red-400">· {formatPrice(r.gmv)} · {r.orders} orders</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Customers + Order mix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5"><Users size={14} /> Customer Growth</h2>
                {customers && <NewVsReturningBar newCount={customers.newCustomers} returningCount={customers.returningCustomers} />}
              </div>
              {customers && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-2.5">
                    <p className="text-[10px] text-text-tertiary flex items-center gap-1"><UserPlus size={10} /> Avg Orders/Customer</p>
                    <p className="text-base font-bold text-text-primary mt-0.5">{customers.avgOrdersPerCustomer}</p>
                  </div>
                  <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-2.5">
                    <p className="text-[10px] text-text-tertiary flex items-center gap-1"><Repeat size={10} /> All-Time Repeat Rate</p>
                    <p className="text-base font-bold text-text-primary mt-0.5">{customers.allTimeRepeatRatePct}%</p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-text-primary mb-3">Order Type Split</h2>
                {orderMix && (
                  <SplitBars
                    rows={orderMix.orderTypeSplit.map((o) => ({ label: ORDER_TYPE_LABELS[o.orderType] || o.orderType, gmv: o.gmv, orders: o.orders }))}
                    total={orderMix.orderTypeSplit.reduce((s, o) => s + o.gmv, 0)}
                  />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary mb-3">Payment Method Split</h2>
                {orderMix && (
                  <SplitBars
                    rows={orderMix.paymentMethodSplit.map((p) => ({ label: p.method === "cod" ? "Cash on Delivery" : "Online", gmv: p.gmv, orders: p.orders }))}
                    total={orderMix.paymentMethodSplit.reduce((s, p) => s + p.gmv, 0)}
                  />
                )}
              </div>
            </section>
          </div>

          {/* Support + Delivery health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5"><MessageSquareWarning size={14} /> Support Ticket Health</h2>
              {supportHealth && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-text-primary">{supportHealth.totalTickets}</p>
                      <p className="text-[10px] text-text-tertiary">Tickets</p>
                    </div>
                    <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-600">{supportHealth.resolutionRatePct}%</p>
                      <p className="text-[10px] text-text-tertiary">Resolved</p>
                    </div>
                    <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-text-primary">{supportHealth.avgResolutionHours !== null ? `${supportHealth.avgResolutionHours}h` : "—"}</p>
                      <p className="text-[10px] text-text-tertiary">Avg Resolution</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-text-primary mb-2">Overdue (open &gt;24h) — always current, not period-filtered</p>
                  {supportHealth.overdueByRestaurant.length === 0 ? (
                    <p className="text-xs text-text-tertiary flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> No overdue tickets right now</p>
                  ) : (
                    <div className="space-y-1.5">
                      {supportHealth.overdueByRestaurant.map((o) => (
                        <div key={o.restaurantId} className="flex items-center justify-between text-xs bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                          <span className="font-semibold text-red-700">{o.name}</span>
                          <span className="text-red-600">{o.count} open · oldest {o.oldestHours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-1.5"><Bike size={14} /> Delivery Performance (Flash)</h2>
              {deliveryHealth && (
                deliveryHealth.totalDispatches === 0 ? (
                  <p className="text-xs text-text-tertiary text-center py-6">No delivery dispatches in this period</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-3">
                      <p className="text-[10px] text-text-tertiary flex items-center gap-1"><CheckCircle2 size={10} /> Dispatch Success</p>
                      <p className="text-lg font-bold text-text-primary mt-0.5">{deliveryHealth.dispatchSuccessRatePct}%</p>
                      <p className="text-[10px] text-text-tertiary mt-0.5">{deliveryHealth.totalDispatches - deliveryHealth.failedDispatches} of {deliveryHealth.totalDispatches}</p>
                    </div>
                    <div className="bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-3">
                      <p className="text-[10px] text-text-tertiary flex items-center gap-1"><Clock size={10} /> Avg Delivery Time</p>
                      <p className="text-lg font-bold text-text-primary mt-0.5">{deliveryHealth.avgDeliveryMinutes !== null ? `${deliveryHealth.avgDeliveryMinutes} min` : "—"}</p>
                    </div>
                  </div>
                )
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
