"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, Star, AlertCircle,
  Loader2, Users, UserPlus, Repeat, MessageSquareWarning, Bike, Clock,
  CheckCircle2, ExternalLink, MapPin, Phone, Mail,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import useAdminRestaurantAnalyticsStore from "@/stores/adminRestaurantAnalyticsStore";
import useAdminRestaurantStore from "@/stores/adminRestaurantStore";
import { LineChart, BarChart, KpiCard, NewVsReturningBar } from "@/components/analytics/charts";
import { DATE_PRESETS } from "@/lib/analyticsDateRanges";

const ORDER_TYPE_LABELS = {
  delivery: "Delivery",
  pickup: "Pickup",
  dine_in: "Dine-in",
  self_service: "Self Service",
};

function SplitBars({ rows, total }) {
  if (!rows || rows.length === 0 || total === 0) {
    return <p className="text-xs text-text-tertiary text-center py-6">No data for this period</p>;
  }
  const colors = ["#2563EB", "#FF5722", "#10B981", "#F59E0B"];
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

function FilterRow({ filters, setFilters }) {
  return (
    <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-3 flex flex-wrap items-center gap-2">
      <select
        value={filters.preset}
        onChange={(e) => setFilters({ preset: e.target.value })}
        className="h-9 px-3 text-xs font-semibold border border-border-light rounded-[var(--radius-md)] bg-white text-text-primary focus:outline-none focus:border-primary"
      >
        {DATE_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {filters.preset === "Custom" && (
        <>
          <input type="date" value={filters.customStart} onChange={(e) => setFilters({ customStart: e.target.value })} className="h-9 px-2 text-xs border border-border-light rounded-[var(--radius-md)] text-text-primary" />
          <span className="text-xs text-text-tertiary">to</span>
          <input type="date" value={filters.customEnd} onChange={(e) => setFilters({ customEnd: e.target.value })} className="h-9 px-2 text-xs border border-border-light rounded-[var(--radius-md)] text-text-primary" />
        </>
      )}

      <select
        value={filters.orderType}
        onChange={(e) => setFilters({ orderType: e.target.value })}
        className="h-9 px-3 text-xs font-semibold border border-border-light rounded-[var(--radius-md)] bg-white text-text-primary focus:outline-none focus:border-primary"
      >
        <option value="all">All order types</option>
        <option value="delivery">Delivery</option>
        <option value="pickup">Pickup</option>
        <option value="dine_in">Dine-in</option>
        <option value="self_service">Self Service</option>
      </select>

      <select
        value={filters.paymentMethod}
        onChange={(e) => setFilters({ paymentMethod: e.target.value })}
        className="h-9 px-3 text-xs font-semibold border border-border-light rounded-[var(--radius-md)] bg-white text-text-primary focus:outline-none focus:border-primary"
      >
        <option value="all">All payment methods</option>
        <option value="online">Online</option>
        <option value="cod">Cash on Delivery</option>
      </select>

      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary cursor-pointer select-none">
        <input type="checkbox" checked={filters.compare} onChange={(e) => setFilters({ compare: e.target.checked })} className="accent-primary" />
        Compare to previous period
      </label>
      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary cursor-pointer select-none">
        <input type="checkbox" checked={filters.includeCancelled} onChange={(e) => setFilters({ includeCancelled: e.target.checked })} className="accent-primary" />
        Include cancelled orders
      </label>
    </div>
  );
}

export default function RestaurantAnalyticsDetail({ params }) {
  const { restaurantId } = use(params);
  const { overview, customers, orderMix, supportHealth, deliveryHealth, isLoading, filters, setFilters, fetchAll, error } = useAdminRestaurantAnalyticsStore();
  const { currentRestaurant, fetchRestaurantDetail } = useAdminRestaurantStore();

  useEffect(() => {
    fetchRestaurantDetail(restaurantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    fetchAll(restaurantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, filters]);

  const kpis = overview?.kpis;
  const showCompare = filters.compare;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/analytics" className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-text-primary truncate">
            {currentRestaurant?.name || "Restaurant Report"}
          </h1>
          {currentRestaurant && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary">
              {currentRestaurant.address?.city && <span className="flex items-center gap-1"><MapPin size={11} /> {currentRestaurant.address.city}</span>}
              {currentRestaurant.contact?.phone && <span className="flex items-center gap-1"><Phone size={11} /> {currentRestaurant.contact.phone}</span>}
              {currentRestaurant.contact?.email && <span className="flex items-center gap-1"><Mail size={11} /> {currentRestaurant.contact.email}</span>}
              {currentRestaurant.rating?.average > 0 && <span className="flex items-center gap-1"><Star size={11} /> {currentRestaurant.rating.average} ({currentRestaurant.rating.totalReviews})</span>}
            </div>
          )}
        </div>
        <Link
          href={`/admin/restaurants/${restaurantId}`}
          className="flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors shrink-0"
        >
          Manage Restaurant <ExternalLink size={12} />
        </Link>
      </div>

      <FilterRow filters={filters} setFilters={setFilters} />

      {error && (
        <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
          <AlertCircle size={15} /> Couldn&apos;t load this restaurant&apos;s analytics.
        </div>
      )}

      {isLoading && !overview ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      ) : kpis ? (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard label="GMV" value={formatPrice(kpis.gmv)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" changePct={showCompare ? kpis.gmvChangePct : null} sub="This restaurant only" />
            <KpiCard label="Orders" value={kpis.orders.toLocaleString("en-IN")} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-50" changePct={showCompare ? kpis.ordersChangePct : null} sub={`AOV ${formatPrice(kpis.aov)}`} />
            <KpiCard label="Platform Revenue" value={formatPrice(kpis.platformRevenue)} icon={IndianRupee} color="text-primary" bg="bg-primary-50" sub={`Commission + fees from this restaurant`} />
            <KpiCard label="Cancellation Rate" value={`${kpis.cancellationRatePct}%`} icon={AlertCircle} color="text-red-500" bg="bg-red-50" sub={kpis.ratingCount > 0 ? `${kpis.rating} ★ (${kpis.ratingCount} rated orders)` : "No ratings yet"} />
          </div>

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
                  {supportHealth.overdueByRestaurant.length === 0 ? (
                    <p className="text-xs text-text-tertiary flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> No tickets overdue right now</p>
                  ) : (
                    <div className="flex items-center justify-between text-xs bg-red-50 border border-red-200 rounded-[var(--radius-md)] px-3 py-2">
                      <span className="font-semibold text-red-700">Overdue right now</span>
                      <span className="text-red-600">{supportHealth.overdueByRestaurant[0].count} open · oldest {supportHealth.overdueByRestaurant[0].oldestHours}h</span>
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
