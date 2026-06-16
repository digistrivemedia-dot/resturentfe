"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ShoppingBag, IndianRupee,
  Star, BarChart3, ChevronRight, ArrowUpRight,
  ShoppingCart, Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ── SVG chart helpers ────────────────────────────────────────────────────────
const W = 500, H = 160, PAD = 20;
function toX(i, total) { return PAD + (i / (total - 1)) * (W - PAD * 2); }
function toY(v, min, max) { return H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2); }
function getPolyline(data) {
  return data.map((v, i) => `${toX(i, data.length)},${toY(v, Math.min(...data), Math.max(...data))}`).join(" ");
}
function getAreaPath(data) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${toX(i, data.length)},${toY(v, min, max)}`);
  return `M ${pts[0].split(",")[0]},${H - PAD} L ${pts.join(" L ")} L ${pts[pts.length - 1].split(",")[0]},${H - PAD} Z`;
}

// ── Mock data by period ───────────────────────────────────────────────────────
const MOCK = {
  "This Week": {
    revenue: 38420,
    orders: 184,
    aov: 209,
    rating: 4.3,
    revenueTrend: [3200, 4100, 3800, 5200, 6800, 8200, 7120],
    ordersTrend: [15, 20, 18, 26, 33, 42, 30],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    topItems: [
      { name: "Butter Chicken", qty: 62, revenue: 11160 },
      { name: "Chicken Biryani", qty: 55, revenue: 13750 },
      { name: "Paneer Tikka", qty: 41, revenue: 8200 },
      { name: "Garlic Naan", qty: 88, revenue: 4400 },
      { name: "Dal Makhani", qty: 34, revenue: 5100 },
    ],
  },
  "This Month": {
    revenue: 148600,
    orders: 712,
    aov: 209,
    rating: 4.4,
    revenueTrend: [4200, 5100, 4800, 6200, 7100, 8400, 5900],
    ordersTrend: [18, 22, 19, 30, 35, 40, 25],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    topItems: [
      { name: "Chicken Biryani", qty: 218, revenue: 54500 },
      { name: "Butter Chicken", qty: 195, revenue: 35100 },
      { name: "Garlic Naan", qty: 320, revenue: 16000 },
      { name: "Paneer Tikka", qty: 145, revenue: 29000 },
      { name: "Veg Thali", qty: 112, revenue: 22400 },
    ],
  },
  "Last Month": {
    revenue: 132400,
    orders: 638,
    aov: 207,
    rating: 4.2,
    revenueTrend: [3800, 4600, 4200, 5800, 6400, 7800, 5100],
    ordersTrend: [16, 20, 17, 27, 31, 38, 22],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    topItems: [
      { name: "Chicken Biryani", qty: 198, revenue: 49500 },
      { name: "Butter Chicken", qty: 175, revenue: 31500 },
      { name: "Garlic Naan", qty: 290, revenue: 14500 },
      { name: "Paneer Tikka", qty: 130, revenue: 26000 },
      { name: "Veg Thali", qty: 98, revenue: 19600 },
    ],
  },
  "Last 3 Months": {
    revenue: 412800,
    orders: 1980,
    aov: 208,
    rating: 4.3,
    revenueTrend: [10200, 12800, 11400, 15600, 18200, 21000, 14800],
    ordersTrend: [48, 62, 55, 78, 88, 102, 72],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    topItems: [
      { name: "Chicken Biryani", qty: 620, revenue: 155000 },
      { name: "Butter Chicken", qty: 558, revenue: 100440 },
      { name: "Garlic Naan", qty: 900, revenue: 45000 },
      { name: "Paneer Tikka", qty: 412, revenue: 82400 },
      { name: "Veg Thali", qty: 318, revenue: 63600 },
    ],
  },
};

const PERIODS = ["This Week", "This Month", "Last Month", "Last 3 Months"];

const NAV_CARDS = [
  {
    title: "Sales Analysis",
    desc: "Revenue breakdown, commissions & payment splits",
    href: "/restaurant/analytics/sales",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Order Insights",
    desc: "Order trends, cancellations & preparation times",
    href: "/restaurant/analytics/orders",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Item Performance",
    desc: "Best sellers, ratings & low performer alerts",
    href: "/restaurant/analytics/items",
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export default function AnalyticsOverview() {
  const [period, setPeriod] = useState("This Week");
  const data = MOCK[period];

  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(data.revenue),
      sub: "+8.4% vs previous",
      trend: "up",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: data.orders.toLocaleString("en-IN"),
      sub: "+12 vs previous",
      trend: "up",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: formatPrice(data.aov),
      sub: "+₹4 vs previous",
      trend: "up",
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Customer Rating",
      value: `${data.rating} ★`,
      sub: "Based on 248 reviews",
      trend: "up",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const revMin = Math.min(...data.revenueTrend);
  const revMax = Math.max(...data.revenueTrend);
  const ordMin = Math.min(...data.ordersTrend);
  const ordMax = Math.max(...data.ordersTrend);
  const barW = Math.floor((W - PAD * 2) / data.ordersTrend.length) - 4;

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Analytics Overview</h1>
            <p className="text-sm text-text-secondary mt-0.5">Track your restaurant's performance</p>
          </div>
          {/* Period Selector */}
          <div className="flex gap-1 bg-white border border-border-light rounded-[var(--radius-lg)] p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] transition-all ${
                  period === p
                    ? "bg-[#FF5722] text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                  kpi.trend === "up" ? "text-emerald-600" : "text-red-500"
                }`}>
                  {kpi.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-text-primary">{kpi.value}</p>
              <p className="text-xs font-medium text-text-secondary mt-1">{kpi.label}</p>
              <p className="text-xs text-text-secondary mt-0.5 opacity-70">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Revenue Trend */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-primary">Revenue Trend</h2>
              <span className="text-xs text-text-secondary">{period}</span>
            </div>
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5722" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF5722" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={getAreaPath(data.revenueTrend)} fill="url(#revGrad)" />
              <polyline
                points={getPolyline(data.revenueTrend)}
                fill="none"
                stroke="#FF5722"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.revenueTrend.map((v, i) => (
                <circle
                  key={i}
                  cx={toX(i, data.revenueTrend.length)}
                  cy={toY(v, revMin, revMax)}
                  r="3.5"
                  fill="white"
                  stroke="#FF5722"
                  strokeWidth="2"
                />
              ))}
            </svg>
            {/* X labels */}
            <div className="flex justify-between mt-1 px-[20px]">
              {data.days.map((d) => (
                <span key={d} className="text-[10px] text-text-secondary">{d}</span>
              ))}
            </div>
          </div>

          {/* Orders Per Day Bar Chart */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-primary">Orders Per Day</h2>
              <span className="text-xs text-text-secondary">{period}</span>
            </div>
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
              {data.ordersTrend.map((v, i) => {
                const bh = ((v - ordMin) / (ordMax - ordMin || 1)) * (H - PAD * 2);
                const x = PAD + i * ((W - PAD * 2) / data.ordersTrend.length) + 2;
                const y = H - PAD - bh;
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barW}
                    height={bh}
                    rx="4"
                    fill={i === data.ordersTrend.length - 1 ? "#FF5722" : "#2563EB"}
                    opacity={i === data.ordersTrend.length - 1 ? 1 : 0.7}
                  />
                );
              })}
            </svg>
            <div className="flex justify-between mt-1 px-[20px]">
              {data.days.map((d) => (
                <span key={d} className="text-[10px] text-text-secondary">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div>
          <h2 className="text-sm font-bold text-text-primary mb-3">Detailed Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NAV_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 flex items-center gap-4 hover:shadow-md hover:border-[#FF5722]/30 transition-all group"
              >
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

        {/* Top 5 Items */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Top 5 Items — {period}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">#</th>
                  <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Item</th>
                  <th className="text-right text-xs font-semibold text-text-secondary pb-3 pr-4">Qty Sold</th>
                  <th className="text-right text-xs font-semibold text-text-secondary pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.topItems.map((item, idx) => (
                  <tr key={item.name} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        idx === 0 ? "bg-amber-100 text-amber-700" :
                        idx === 1 ? "bg-gray-100 text-gray-600" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-bg-secondary text-text-secondary"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-sm font-bold text-text-primary">{item.qty}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-bold text-[#FF5722]">{formatPrice(item.revenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
