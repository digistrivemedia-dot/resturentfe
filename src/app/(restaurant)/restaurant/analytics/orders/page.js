"use client";

import { useState } from "react";
import {
  ShoppingBag, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ── SVG helpers ───────────────────────────────────────────────────────────────
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = {
  Week: {
    total: 184,
    completed: 162,
    cancelled: 16,
    rejected: 6,
    avgPrepTime: 22,
    ordersTrend: [15, 20, 18, 26, 33, 42, 30],
    prepTrend: [20, 23, 21, 25, 22, 19, 24],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  Month: {
    total: 712,
    completed: 634,
    cancelled: 58,
    rejected: 20,
    avgPrepTime: 21,
    ordersTrend: [18, 22, 19, 30, 35, 40, 25],
    prepTrend: [22, 20, 21, 24, 20, 18, 22],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  Quarter: {
    total: 1980,
    completed: 1762,
    cancelled: 168,
    rejected: 50,
    avgPrepTime: 22,
    ordersTrend: [48, 62, 55, 78, 88, 102, 72],
    prepTrend: [24, 22, 21, 23, 20, 19, 21],
    days: ["Apr W1", "Apr W2", "May W1", "May W2", "Jun W1", "Jun W2", "Jun W3"],
  },
};

const PERIODS = ["Week", "Month", "Quarter"];

const CANCEL_REASONS = [
  { reason: "Customer changed mind", pct: 38 },
  { reason: "Long wait time", pct: 28 },
  { reason: "Item unavailable", pct: 18 },
  { reason: "Delivery issue", pct: 10 },
  { reason: "Wrong order placed", pct: 6 },
];

// Hourly distribution: 12 bars (8am–8pm)
const HOUR_LABELS = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "8pm"];
const HOUR_ORDERS = [4, 8, 12, 18, 28, 32, 24, 16, 14, 20, 26, 18];

const VALUE_BUCKETS = [
  { range: "₹0 – ₹200", count: 62, revenue: 8680 },
  { range: "₹200 – ₹500", count: 88, revenue: 30800 },
  { range: "₹500 – ₹1,000", count: 24, revenue: 16800 },
  { range: "₹1,000+", count: 10, revenue: 14200 },
];

export default function OrderInsights() {
  const [period, setPeriod] = useState("Week");
  const data = MOCK[period];

  const completedPct = Math.round((data.completed / data.total) * 100);
  const cancelledPct = Math.round((data.cancelled / data.total) * 100);
  const rejectedPct = Math.round((data.rejected / data.total) * 100);

  const hourMax = Math.max(...HOUR_ORDERS);
  const barW = Math.floor((W - PAD * 2) / HOUR_ORDERS.length) - 3;

  const kpis = [
    {
      label: "Total Orders",
      value: data.total.toLocaleString("en-IN"),
      sub: "All order types",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Completed",
      value: data.completed.toLocaleString("en-IN"),
      sub: `${completedPct}% completion rate`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Cancelled",
      value: data.cancelled.toLocaleString("en-IN"),
      sub: `${cancelledPct}% of total`,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Avg Prep Time",
      value: `${data.avgPrepTime} min`,
      sub: "Kitchen to ready",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Order Insights</h1>
            <p className="text-sm text-text-secondary mt-0.5">Order trends, cancellations & prep time analysis</p>
          </div>
          <div className="flex gap-1 bg-white border border-border-light rounded-[var(--radius-lg)] p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] transition-all ${
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
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <p className="text-2xl font-extrabold text-text-primary">{kpi.value}</p>
              <p className="text-xs font-medium text-text-secondary mt-1">{kpi.label}</p>
              <p className="text-xs text-text-secondary mt-0.5 opacity-70">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Orders Per Day Line Chart */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Orders Per Day</h2>
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
              <defs>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={getAreaPath(data.ordersTrend)} fill="url(#ordGrad)" />
              <polyline
                points={getPolyline(data.ordersTrend)}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {data.ordersTrend.map((v, i) => {
                const min = Math.min(...data.ordersTrend);
                const max = Math.max(...data.ordersTrend);
                return (
                  <circle
                    key={i}
                    cx={toX(i, data.ordersTrend.length)}
                    cy={toY(v, min, max)}
                    r="3.5"
                    fill="white"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            <div className="flex justify-between mt-1 px-5">
              {data.days.map((d) => (
                <span key={d} className="text-[10px] text-text-secondary">{d}</span>
              ))}
            </div>
          </div>

          {/* Avg Prep Time Trend */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Avg Prep Time Trend (minutes)</h2>
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
              <polyline
                points={getPolyline(data.prepTrend)}
                fill="none"
                stroke="#FF5722"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
              />
              {data.prepTrend.map((v, i) => {
                const min = Math.min(...data.prepTrend);
                const max = Math.max(...data.prepTrend);
                return (
                  <circle
                    key={i}
                    cx={toX(i, data.prepTrend.length)}
                    cy={toY(v, min, max)}
                    r="3.5"
                    fill="#FF5722"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
            <div className="flex justify-between mt-1 px-5">
              {data.days.map((d) => (
                <span key={d} className="text-[10px] text-text-secondary">{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status + Cancellation Reasons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-5">Order Status Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "Completed", count: data.completed, pct: completedPct, color: "bg-emerald-500" },
                { label: "Cancelled", count: data.cancelled, pct: cancelledPct, color: "bg-red-400" },
                { label: "Rejected", count: data.rejected, pct: rejectedPct, color: "bg-amber-400" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-text-secondary">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">{s.count}</span>
                      <span className="text-xs text-text-secondary">({s.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full transition-all duration-700`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Reasons */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-5">Cancellation Reasons</h2>
            <div className="space-y-3">
              {CANCEL_REASONS.map((r, i) => (
                <div key={r.reason}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-text-secondary truncate flex-1 pr-2">{r.reason}</span>
                    <span className="text-xs font-bold text-text-primary flex-shrink-0">{r.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${r.pct}%`,
                        backgroundColor: ["#EF4444", "#F97316", "#EAB308", "#6366F1", "#EC4899"][i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Hourly Order Distribution (8am – 8pm)</h2>
          <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
            {HOUR_ORDERS.map((v, i) => {
              const bh = (v / hourMax) * (H - PAD * 2);
              const x = PAD + i * ((W - PAD * 2) / HOUR_ORDERS.length) + 2;
              const y = H - PAD - bh;
              const isLunch = i >= 4 && i <= 5;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={bh}
                    rx="3"
                    fill={isLunch ? "#FF5722" : "#2563EB"}
                    opacity={isLunch ? 1 : 0.65}
                  />
                  <text
                    x={x + barW / 2}
                    y={y - 3}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#6B7280"
                  >
                    {v}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between mt-1 px-5">
            {HOUR_LABELS.map((h) => (
              <span key={h} className="text-[9px] text-text-secondary">{h}</span>
            ))}
          </div>
        </div>

        {/* Order Value Buckets */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Order Value Distribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  {["Value Range", "Order Count", "Revenue", "% of Orders", "% of Revenue"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VALUE_BUCKETS.map((b) => {
                  const totalOrders = VALUE_BUCKETS.reduce((s, x) => s + x.count, 0);
                  const totalRev = VALUE_BUCKETS.reduce((s, x) => s + x.revenue, 0);
                  const orderPct = Math.round((b.count / totalOrders) * 100);
                  const revPct = Math.round((b.revenue / totalRev) * 100);
                  return (
                    <tr key={b.range} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                      <td className="py-3 pr-4 text-sm font-semibold text-text-primary">{b.range}</td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">{b.count}</td>
                      <td className="py-3 pr-4 text-sm font-semibold text-[#FF5722]">{formatPrice(b.revenue)}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${orderPct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-text-primary w-8">{orderPct}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF5722] rounded-full" style={{ width: `${revPct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-text-primary w-8">{revPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
