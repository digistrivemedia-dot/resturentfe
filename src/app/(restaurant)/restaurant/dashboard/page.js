"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag, IndianRupee,
  Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw,
  AlertTriangle, Users, BarChart3, ArrowUpRight, Loader2,
  UtensilsCrossed, Tag, ClipboardList, Star, BarChart2,
} from "lucide-react";
import useRestaurantDashboardStore from "@/stores/restaurantDashboardStore";
import useAuthStore from "@/stores/authStore";

function MiniBarChart({ data, key, max, color, label }) {
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const pct = (d[key] / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {key === "revenue" ? `₹${d[key]}` : d[key]}
            </div>
            <div
              className={`w-full rounded-t-[3px] transition-all duration-500 ${
                isToday ? color : `${color} opacity-40`
              }`}
              style={{ height: `${pct}%`, minHeight: "4px" }}
            />
            <span className={`text-[9px] font-medium ${isToday ? "text-text-primary" : "text-text-tertiary"}`}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LiveOrderCard({ order, onAccept, onReject }) {
  const waitingMins = order.createdAt ? Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000) : 0;
  const urgentColor = waitingMins >= 5 ? "text-error" : waitingMins >= 3 ? "text-warning" : "text-success";
  const isConfirmed = order.status === "confirmed";
  const total = order.pricing?.total || order.total || 0;

  return (
    <div className={`bg-white rounded-[var(--radius-xl)] border-2 overflow-hidden transition-all ${
      isConfirmed ? "border-success/30" : waitingMins >= 5 ? "border-error/30" : "border-border-light"
    }`}>
      {/* Status bar */}
      <div className={`px-4 py-2 flex items-center justify-between text-xs font-semibold ${
        isConfirmed ? "bg-success-light text-success-dark" : "bg-warning-light text-warning"
      }`}>
        <span>{isConfirmed ? "Accepted — Preparing" : "New Order"}</span>
        <span className={`font-bold flex items-center gap-1 ${urgentColor}`}>
          {waitingMins < 1 ? "Just now" : `${waitingMins}m ago`}
          {waitingMins >= 5 && <AlertTriangle size={11} strokeWidth={2.5} />}
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-bold text-text-primary">{order.customer.name}</p>
            <p className="text-xs text-text-tertiary">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-text-primary">₹{total}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              order.paymentMethod === "cod"
                ? "bg-warning-light text-warning"
                : "bg-success-light text-success"
            }`}>
              {order.paymentMethod === "cod" ? "COD" : "Paid"}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {order.items.map((item, i) => (
            <span key={i} className="text-xs bg-bg-secondary text-text-secondary px-2 py-0.5 rounded-full">
              {item.quantity}× {item.name}
            </span>
          ))}
        </div>

        {/* Actions */}
        {!isConfirmed ? (
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(order._id)}
              className="flex-1 h-9 bg-success text-white text-xs font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-1.5 hover:bg-success/90 transition-colors"
            >
              <CheckCircle2 size={14} /> Accept
            </button>
            <button
              onClick={() => onReject(order._id)}
              className="flex-1 h-9 bg-error-light text-error text-xs font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-1.5 hover:bg-error/20 transition-colors"
            >
              <XCircle size={14} /> Reject
            </button>
            <Link
              href={`/restaurant/orders/${order._id}`}
              className="h-9 px-3 border border-border-light text-xs font-semibold text-text-secondary rounded-[var(--radius-lg)] flex items-center hover:bg-bg-hover transition-colors"
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/restaurant/orders"
              className="flex-1 h-9 bg-primary-50 text-primary text-xs font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
            >
              View in Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RestaurantDashboard() {
  const { user } = useAuthStore();
  const {
    stats, liveOrders, isStatsLoading,
    fetchDashboardStats, fetchLiveOrders, acceptOrder, rejectOrder,
  } = useRestaurantDashboardStore();
  const [chartMetric, setChartMetric] = useState("revenue");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchLiveOrders();
  }, []);

  const pendingCount = liveOrders.filter((o) => o.status === "placed").length;

  // Build stats cards from API data
  const todayStats = [
    {
      label: "Today's Revenue",
      value: `₹${(stats?.todayRevenue || 0).toLocaleString("en-IN")}`,
      sub: stats?.weekRevenue ? `₹${stats.weekRevenue.toLocaleString("en-IN")} this week` : "",
      trend: (stats?.weekRevenue || 0) >= (stats?.lastWeekRevenue || 0) ? "up" : "down",
      icon: IndianRupee,
      color: "text-success",
      bg: "bg-success-light",
    },
    {
      label: "Today's Orders",
      value: String(stats?.todayOrders || 0),
      sub: "",
      trend: "up",
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      label: "Avg Order Value",
      value: `₹${stats?.avgOrderValue || 0}`,
      sub: "",
      trend: "neutral",
      icon: BarChart3,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      label: "Pending Orders",
      value: String(stats?.pendingOrders || 0),
      sub: (stats?.pendingOrders || 0) > 0 ? "Need attention" : "All clear",
      trend: (stats?.pendingOrders || 0) > 0 ? "neutral" : "up",
      icon: Clock,
      color: "text-error",
      bg: "bg-error-light",
    },
  ];

  // Build weekly chart data from stats
  const weekRevenue = stats?.weekRevenue || 0;
  const lastWeekRevenue = stats?.lastWeekRevenue || 0;
  const WEEKLY = [
    { day: "Last Week", orders: 0, revenue: lastWeekRevenue },
    { day: "This Week", orders: stats?.todayOrders || 0, revenue: weekRevenue },
  ];
  const MAX_REVENUE = Math.max(...WEEKLY.map((d) => d.revenue), 1);
  const MAX_ORDERS = Math.max(...WEEKLY.map((d) => d.orders), 1);

  const handleAccept = async (id) => {
    try {
      await acceptOrder(id);
    } catch {}
  };

  const handleReject = async (id) => {
    try {
      await rejectOrder(id);
    } catch {}
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchLiveOrders()]);
    setIsRefreshing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-1">Restaurant Portal</p>
          <h1 className="text-2xl font-extrabold text-text-primary">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="hidden sm:flex items-center gap-2 h-9 px-4 border border-border-light rounded-[var(--radius-lg)] text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors"
        >
          <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {todayStats.map(({ label, value, sub, trend, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              {trend === "up" && <TrendingUp size={14} className="text-success" />}
              {trend === "down" && <TrendingDown size={14} className="text-error" />}
              {trend === "neutral" && <AlertTriangle size={14} className="text-warning" />}
            </div>
            <p className="text-xl font-extrabold text-text-primary">{value}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
            <p className={`text-[10px] font-semibold mt-1 ${
              trend === "up" ? "text-success" : trend === "down" ? "text-error" : "text-warning"
            }`}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Live Orders — left / main */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">Live Orders</h2>
              {pendingCount > 0 && (
                <span className="text-xs font-extrabold bg-error text-white px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <Link
              href="/restaurant/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {liveOrders.length === 0 ? (
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light py-14 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-bg-secondary rounded-full flex items-center justify-center">
                <ShoppingBag size={28} className="text-text-tertiary" />
              </div>
              <p className="text-sm font-semibold text-text-primary">No active orders</p>
              <p className="text-xs text-text-secondary">New orders will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveOrders.map((o) => (
                <LiveOrderCard key={o._id} order={o} onAccept={handleAccept} onReject={handleReject} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar — chart + quick actions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Weekly chart */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">This Week</h3>
              <div className="flex bg-bg-secondary rounded-[var(--radius-lg)] p-0.5">
                {[
                  { key: "revenue", label: "Revenue" },
                  { key: "orders",  label: "Orders" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setChartMetric(key)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-md)] transition-all ${
                      chartMetric === key
                        ? "bg-white text-text-primary shadow-[var(--shadow-sm)]"
                        : "text-text-tertiary hover:text-text-secondary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <MiniBarChart
              data={WEEKLY}
              key={chartMetric}
              max={chartMetric === "revenue" ? MAX_REVENUE : MAX_ORDERS}
              color={chartMetric === "revenue" ? "bg-success" : "bg-primary"}
              label={chartMetric}
            />

            {/* Totals */}
            <div className="mt-3 pt-3 border-t border-border-light grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-tertiary">This Week</p>
                <p className="text-base font-extrabold text-text-primary">
                  ₹{(stats?.weekRevenue || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Last Week</p>
                <p className="text-base font-extrabold text-text-primary">
                  ₹{(stats?.lastWeekRevenue || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <h3 className="text-sm font-bold text-text-primary mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { href: "/restaurant/menu",            label: "Update Menu",      icon: UtensilsCrossed, desc: "Add or edit items" },
                { href: "/restaurant/coupons",         label: "Create Coupon",    icon: Tag,             desc: "Boost sales with offers" },
                { href: "/restaurant/orders",          label: "View All Orders",  icon: ClipboardList,   desc: `${liveOrders.length} active` },
                { href: "/restaurant/reviews",         label: "Check Reviews",    icon: Star,            desc: "View reviews" },
                { href: "/restaurant/analytics/sales", label: "Sales Report",     icon: BarChart2,       desc: "This week overview" },
              ].map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-2.5 rounded-[var(--radius-lg)] hover:bg-bg-secondary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-xs text-text-tertiary">{desc}</p>
                  </div>
                  <ChevronRight size={13} className="text-text-tertiary shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent customers */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Users size={14} className="text-primary" /> Recent Customers
              </h3>
            </div>
            <div className="space-y-2.5">
              {[
                { name: "Amit Sharma",  orders: 3, spent: 1401 },
                { name: "Priya Nair",   orders: 1, spent: 677 },
                { name: "Ravi Mehta",   orders: 5, spent: 2240 },
              ].map(({ name, orders, spent }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary">{name}</p>
                    <p className="text-[10px] text-text-tertiary">{orders} order{orders > 1 ? "s" : ""}</p>
                  </div>
                  <p className="text-xs font-bold text-text-primary">₹{spent}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
