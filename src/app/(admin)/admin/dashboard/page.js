"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bike,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  IndianRupee,
  MessageSquareWarning,
  ShoppingBag,
  Store,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";
import useAdminDashboardStore from "@/stores/adminDashboardStore";
import useAdminOrderStore from "@/stores/adminOrderStore";

const revenueTrend = [
  { day: "08 May", gmv: 185000, commission: 27750 },
  { day: "11 May", gmv: 212000, commission: 31800 },
  { day: "14 May", gmv: 196000, commission: 29400 },
  { day: "17 May", gmv: 241000, commission: 36150 },
  { day: "20 May", gmv: 268000, commission: 40200 },
  { day: "23 May", gmv: 259000, commission: 38850 },
  { day: "26 May", gmv: 301000, commission: 45150 },
  { day: "29 May", gmv: 326000, commission: 48900 },
  { day: "01 Jun", gmv: 348000, commission: 52200 },
  { day: "04 Jun", gmv: 372000, commission: 55800 },
  { day: "06 Jun", gmv: 391000, commission: 58650 },
];

const maxRevenue = Math.max(...revenueTrend.map((point) => point.gmv));
const chartWidth = 720;
const chartHeight = 260;
const chartPadding = { top: 20, right: 18, bottom: 34, left: 42 };
const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

function getChartPoints(key) {
  return revenueTrend.map((point, index) => {
    const x = chartPadding.left + (index / (revenueTrend.length - 1)) * chartInnerWidth;
    const y = chartPadding.top + chartInnerHeight - (point[key] / maxRevenue) * chartInnerHeight;

    return { ...point, x, y };
  });
}

function getPolyline(points) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function getAreaPath(points) {
  const first = points[0];
  const last = points[points.length - 1];

  return `M ${first.x} ${chartPadding.top + chartInnerHeight} L ${getPolyline(points)} L ${last.x} ${chartPadding.top + chartInnerHeight} Z`;
}

const registrations = [
  {
    name: "Urban Thali Co.",
    owner: "Meera Iyer",
    area: "Lower Parel",
    cuisines: "North Indian, Thali",
    submittedAt: "Today, 10:20 AM",
    status: "KYC pending",
  },
  {
    name: "Sushi Lane",
    owner: "Arjun Rao",
    area: "Bandra West",
    cuisines: "Japanese, Asian",
    submittedAt: "Today, 09:15 AM",
    status: "FSSAI review",
  },
  {
    name: "Green Bowl Kitchen",
    owner: "Nisha Shah",
    area: "Powai",
    cuisines: "Healthy, Salads",
    submittedAt: "Yesterday, 06:40 PM",
    status: "Bank details",
  },
];

const statusStyles = {
  delivered: "bg-success-light text-success-dark",
  preparing: "bg-warning-light text-warning-dark",
  out_for_delivery: "bg-info-light text-info-dark",
  cancelled: "bg-error-light text-error-dark",
};

function formatStatus(status) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(num) {
  if (!num && num !== 0) return "—";
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${stat.bg}`}>
          <Icon size={17} className={stat.color} strokeWidth={2} />
        </div>
        <TrendingUp size={13} className="text-success shrink-0 mt-0.5" />
      </div>
      <p className="text-xl font-extrabold text-text-primary tracking-tight">{stat.value}</p>
      <p className="text-[11px] font-medium text-text-tertiary mt-0.5 leading-tight">{stat.label}</p>
      <p className="text-[11px] font-semibold text-success mt-1.5">{stat.sub}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { stats, isLoading, fetchDashboardStats } = useAdminDashboardStore();
  const { orders, fetchOrders } = useAdminOrderStore();

  useEffect(() => {
    try {
      fetchDashboardStats();
    } catch (_) {}
    try {
      fetchOrders({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
    } catch (_) {}
  }, []);

  const statCards = [
    {
      label: "Total Revenue (GMV)",
      value: stats ? formatNumber(stats.monthGMV) : "—",
      sub: stats ? `${stats.monthOrders} orders this month` : "Loading...",
      icon: IndianRupee,
      color: "text-success",
      bg: "bg-success-light",
    },
    {
      label: "Platform Commission",
      value: stats ? formatNumber(stats.todayCommission) : "—",
      sub: "Today's commission",
      icon: CircleDollarSign,
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      label: "Active Restaurants",
      value: stats ? `${stats.activeRestaurants ?? "—"}` : "—",
      sub: stats ? `${stats.pendingApprovals ?? 0} awaiting approval` : "Loading...",
      icon: Store,
      color: "text-info",
      bg: "bg-info-light",
    },
    {
      label: "Active Customers",
      value: stats ? `${stats.totalCustomers?.toLocaleString() ?? "—"}` : "—",
      sub: "Total registered",
      icon: Users,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      label: "Delivery Partners",
      value: "—",
      sub: "—",
      icon: Bike,
      color: "text-secondary-dark",
      bg: "bg-success-light",
    },
    {
      label: "Orders Today",
      value: stats ? `${stats.totalOrdersToday?.toLocaleString() ?? "—"}` : "—",
      sub: stats ? `${stats.pendingOrders ?? 0} live orders` : "Loading...",
      icon: ShoppingBag,
      color: "text-error",
      bg: "bg-error-light",
    },
  ];

  const pendingActions = [
    {
      title: "Restaurants awaiting approval",
      value: stats?.pendingApprovals ?? "—",
      href: "/admin/restaurants",
      icon: Store,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      title: "Delivery partners pending verification",
      value: 14,
      href: "/admin/delivery-partners",
      icon: UserCheck,
      color: "text-info",
      bg: "bg-info-light",
    },
    {
      title: "Unresolved customer complaints",
      value: 6,
      href: "/admin/reviews",
      icon: MessageSquareWarning,
      color: "text-error",
      bg: "bg-error-light",
    },
  ];

  const recentOrders = orders.slice(0, 5).map((order) => ({
    orderNumber: order.orderNumber,
    restaurant: order.restaurant?.name ?? "—",
    customer: order.customer?.name ?? "—",
    total: order.pricing?.total ?? 0,
    status: order.status,
    createdAt: order.createdAt,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-2xl font-extrabold text-text-primary">Platform Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Live marketplace health, registrations &amp; action queues.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success-light border border-success/20 px-3.5 py-2 rounded-[var(--radius-lg)] w-fit">
          <CheckCircle2 size={13} strokeWidth={2.5} />
          All core systems operational
        </div>
      </div>

      {isLoading && !stats ? (
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
          {statCards.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">Revenue Trend</h2>
              <p className="text-xs text-text-tertiary">30-day GMV and commission earned</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                GMV
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                Commission
              </span>
            </div>
          </div>

          <div className="min-w-0 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-[280px] w-full min-w-[620px]"
              role="img"
              aria-label="30-day revenue and commission trend"
            >
              <defs>
                <linearGradient id="adminGmvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity="0.22" />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="adminCommissionFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity="0.18" />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartPadding.top + chartInnerHeight * ratio;
                const value = maxRevenue * (1 - ratio);

                return (
                  <g key={ratio}>
                    <line
                      x1={chartPadding.left}
                      x2={chartPadding.left + chartInnerWidth}
                      y1={y}
                      y2={y}
                      stroke="var(--border-light)"
                      strokeWidth="1"
                    />
                    <text
                      x={chartPadding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-text-tertiary text-[11px]"
                    >
                      ₹{Math.round(value / 1000)}k
                    </text>
                  </g>
                );
              })}

              <path d={getAreaPath(getChartPoints("gmv"))} fill="url(#adminGmvFill)" />
              <path d={getAreaPath(getChartPoints("commission"))} fill="url(#adminCommissionFill)" />
              <polyline
                points={getPolyline(getChartPoints("gmv"))}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={getPolyline(getChartPoints("commission"))}
                fill="none"
                stroke="var(--success)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {getChartPoints("gmv").map((point, index) => (
                <g key={point.day}>
                  <circle cx={point.x} cy={point.y} r={index === revenueTrend.length - 1 ? 5 : 3.5} fill="var(--primary)" />
                  <text
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-text-tertiary text-[11px]"
                  >
                    {point.day.replace(" ", "\n")}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-text-primary">Pending Actions</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Admin queues needing review</p>
            </div>
            <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-warning-light flex items-center justify-center">
              <AlertTriangle size={15} className="text-warning" strokeWidth={2} />
            </div>
          </div>

          <div className="space-y-2.5">
            {pendingActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] border border-border-light hover:border-primary/30 hover:bg-bg-secondary transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${action.bg}`}>
                      <Icon size={16} className={action.color} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{action.title}</p>
                      <p className="text-xs text-text-tertiary">Open queue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-lg font-extrabold text-text-primary">{action.value}</span>
                    <ArrowUpRight size={13} className="text-text-tertiary group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-border-light flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Recent Orders</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Live feed across all restaurants</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-border-light">
            {recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-tertiary">No recent orders</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.orderNumber} className="px-4 md:px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">#{order.orderNumber}</p>
                    <p className="text-xs text-text-secondary truncate">
                      {order.restaurant} · {order.customer}
                    </p>
                    <p className="text-[11px] text-text-tertiary flex items-center gap-1 mt-0.5">
                      <Clock3 size={11} />
                      {timeAgo(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-text-primary">{formatPrice(order.total)}</p>
                    <span className={`inline-flex mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${statusStyles[order.status] || "bg-bg-secondary text-text-secondary"}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-border-light flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">New Registrations</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Latest onboarding submissions</p>
            </div>
            <Link href="/admin/restaurants" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5">
              Review <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="divide-y divide-border-light">
            {registrations.map((restaurant) => (
              <div key={restaurant.name} className="px-4 md:px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{restaurant.name}</p>
                    <p className="text-xs text-text-secondary truncate">
                      {restaurant.owner} · {restaurant.area}
                    </p>
                    <p className="text-xs text-text-tertiary truncate mt-1">{restaurant.cuisines}</p>
                  </div>
                  <span className="text-[11px] font-bold bg-warning-light text-warning-dark px-2 py-1 rounded-full shrink-0">
                    {restaurant.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-tertiary mt-2">{restaurant.submittedAt}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
