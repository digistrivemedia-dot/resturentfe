"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, IndianRupee, Percent, Calendar, CreditCard,
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
    gross: 38420,
    net: 34578,
    commission: 3842,
    avgDaily: 5488,
    dailyRevenue: [3200, 4100, 3800, 5200, 6800, 8200, 7120],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    table: [
      { date: "Mon, Jun 2", orders: 15, gross: 3200 },
      { date: "Tue, Jun 3", orders: 20, gross: 4100 },
      { date: "Wed, Jun 4", orders: 18, gross: 3800 },
      { date: "Thu, Jun 5", orders: 26, gross: 5200 },
      { date: "Fri, Jun 6", orders: 33, gross: 6800 },
      { date: "Sat, Jun 7", orders: 42, gross: 8200 },
      { date: "Sun, Jun 8", orders: 30, gross: 7120 },
    ],
  },
  Month: {
    gross: 148600,
    net: 133740,
    commission: 14860,
    avgDaily: 4953,
    dailyRevenue: [4200, 5100, 4800, 6200, 7100, 8400, 5900],
    days: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
    table: [
      { date: "Week 1", orders: 112, gross: 21200 },
      { date: "Week 2", orders: 138, gross: 25600 },
      { date: "Week 3", orders: 124, gross: 23100 },
      { date: "Week 4", orders: 168, gross: 31200 },
      { date: "Week 5", orders: 170, gross: 47500 },
    ],
  },
  Quarter: {
    gross: 412800,
    net: 371520,
    commission: 41280,
    avgDaily: 4587,
    dailyRevenue: [10200, 12800, 11400, 15600, 18200, 21000, 14800],
    days: ["Apr W1", "Apr W2", "May W1", "May W2", "Jun W1", "Jun W2", "Jun W3"],
    table: [
      { date: "April", orders: 638, gross: 132400 },
      { date: "May", orders: 712, gross: 148600 },
      { date: "June (partial)", orders: 630, gross: 131800 },
    ],
  },
};

const PERIODS = ["Week", "Month", "Quarter"];

const PAYMENT_METHODS = [
  { label: "Online (UPI/Card)", pct: 65, color: "#2563EB" },
  { label: "Cash on Delivery", pct: 25, color: "#FF5722" },
  { label: "Wallet", pct: 10, color: "#8B5CF6" },
];

// Heatmap: 7 rows (Mon–Sun) × 12 cols (8am–8pm)
const DAYS_LABEL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS_LABEL = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "8pm"];
const HEATMAP_DATA = [
  [1, 2, 3, 4, 8, 10, 7, 4, 3, 5, 8, 6],
  [1, 2, 3, 5, 9, 11, 8, 4, 3, 5, 7, 5],
  [1, 1, 2, 3, 7, 9, 6, 3, 2, 4, 6, 4],
  [2, 2, 4, 6, 10, 13, 9, 5, 4, 6, 9, 7],
  [2, 3, 5, 7, 11, 14, 10, 6, 5, 7, 11, 9],
  [3, 5, 7, 9, 12, 15, 12, 8, 7, 9, 13, 11],
  [2, 4, 6, 8, 10, 12, 10, 7, 6, 8, 10, 8],
];
const HEATMAP_MAX = 15;

function intensityColor(val, max) {
  const t = val / max;
  const r = Math.round(255 - t * (255 - 255));
  const g = Math.round(255 - t * (255 - 87));
  const b = Math.round(255 - t * (255 - 34));
  return `rgba(255,${Math.round(87 + (1 - t) * 168)},${Math.round(34 + (1 - t) * 221)},${0.1 + t * 0.85})`;
}

export default function SalesAnalysis() {
  const [period, setPeriod] = useState("Week");
  const data = MOCK[period];

  const kpis = [
    {
      label: "Gross Revenue",
      value: formatPrice(data.gross),
      sub: "Before platform fee",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "up",
    },
    {
      label: "Net Revenue",
      value: formatPrice(data.net),
      sub: "After platform fee",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "up",
    },
    {
      label: "Platform Commission",
      value: formatPrice(data.commission),
      sub: "10% of gross",
      icon: Percent,
      color: "text-red-500",
      bg: "bg-red-50",
      trend: "down",
    },
    {
      label: "Avg Daily Revenue",
      value: formatPrice(data.avgDaily),
      sub: "Per day average",
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: "up",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Sales Analysis</h1>
            <p className="text-sm text-text-secondary mt-0.5">Revenue, commissions & payment breakdown</p>
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
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon size={18} className={kpi.color} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {kpi.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-text-primary">{kpi.value}</p>
              <p className="text-xs font-medium text-text-secondary mt-1">{kpi.label}</p>
              <p className="text-xs text-text-secondary mt-0.5 opacity-70">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Daily Revenue — {period}</h2>
          <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="w-full">
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={getAreaPath(data.dailyRevenue)} fill="url(#salesGrad)" />
            <polyline
              points={getPolyline(data.dailyRevenue)}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.dailyRevenue.map((v, i) => {
              const min = Math.min(...data.dailyRevenue);
              const max = Math.max(...data.dailyRevenue);
              return (
                <circle
                  key={i}
                  cx={toX(i, data.dailyRevenue.length)}
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

        {/* Revenue Breakdown Table */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Revenue Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  {["Date", "Orders", "Gross Revenue", "Commission (10%)", "Net Revenue"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.table.map((row, i) => {
                  const comm = Math.round(row.gross * 0.1);
                  const net = row.gross - comm;
                  return (
                    <tr key={i} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                      <td className="py-3 pr-4 text-sm font-medium text-text-primary">{row.date}</td>
                      <td className="py-3 pr-4 text-sm text-text-secondary">{row.orders}</td>
                      <td className="py-3 pr-4 text-sm font-semibold text-text-primary">{formatPrice(row.gross)}</td>
                      <td className="py-3 pr-4 text-sm text-red-500 font-semibold">-{formatPrice(comm)}</td>
                      <td className="py-3 text-sm font-bold text-emerald-600">{formatPrice(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-bg-secondary">
                  <td className="py-3 pr-4 text-xs font-bold text-text-primary">Total</td>
                  <td className="py-3 pr-4 text-xs font-bold text-text-primary">
                    {data.table.reduce((s, r) => s + r.orders, 0)}
                  </td>
                  <td className="py-3 pr-4 text-xs font-bold text-text-primary">{formatPrice(data.gross)}</td>
                  <td className="py-3 pr-4 text-xs font-bold text-red-500">-{formatPrice(data.commission)}</td>
                  <td className="py-3 text-xs font-bold text-emerald-600">{formatPrice(data.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bottom Row: Payment Split + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Payment Methods */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={16} className="text-text-secondary" />
              <h2 className="text-sm font-bold text-text-primary">Payment Method Split</h2>
            </div>

            {/* Donut via SVG stroke-dasharray */}
            <div className="flex items-center gap-8">
              <div className="relative flex-shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {/* BG circle */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#F3F4F6" strokeWidth="14" />
                  {/* Online 65% */}
                  <circle
                    cx="60" cy="60" r="48"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="14"
                    strokeDasharray={`${2 * Math.PI * 48 * 0.65} ${2 * Math.PI * 48}`}
                    strokeDashoffset={0}
                    transform="rotate(-90 60 60)"
                  />
                  {/* COD 25% — offset = 65% */}
                  <circle
                    cx="60" cy="60" r="48"
                    fill="none"
                    stroke="#FF5722"
                    strokeWidth="14"
                    strokeDasharray={`${2 * Math.PI * 48 * 0.25} ${2 * Math.PI * 48}`}
                    strokeDashoffset={-2 * Math.PI * 48 * 0.65}
                    transform="rotate(-90 60 60)"
                  />
                  {/* Wallet 10% — offset = 90% */}
                  <circle
                    cx="60" cy="60" r="48"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="14"
                    strokeDasharray={`${2 * Math.PI * 48 * 0.10} ${2 * Math.PI * 48}`}
                    strokeDashoffset={-2 * Math.PI * 48 * 0.90}
                    transform="rotate(-90 60 60)"
                  />
                  <text x="60" y="57" textAnchor="middle" className="text-xs" fontSize="11" fontWeight="700" fill="#1F2937">
                    Payments
                  </text>
                  <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#6B7280">
                    {period}
                  </text>
                </svg>
              </div>
              <div className="flex-1 space-y-3">
                {PAYMENT_METHODS.map((pm) => (
                  <div key={pm.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pm.color }} />
                        <span className="text-xs font-medium text-text-secondary">{pm.label}</span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">{pm.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pm.pct}%`, backgroundColor: pm.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Peak Hours Heatmap */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Peak Hours Heatmap</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[380px]">
                {/* Hour labels */}
                <div className="flex mb-1 pl-8">
                  {HOURS_LABEL.map((h) => (
                    <div key={h} className="flex-1 text-center text-[9px] text-text-secondary">{h}</div>
                  ))}
                </div>
                {HEATMAP_DATA.map((row, ri) => (
                  <div key={ri} className="flex items-center mb-0.5">
                    <span className="text-[9px] text-text-secondary w-8 flex-shrink-0">{DAYS_LABEL[ri]}</span>
                    {row.map((val, ci) => (
                      <div
                        key={ci}
                        className="flex-1 h-5 rounded-[3px] mx-px"
                        style={{ backgroundColor: intensityColor(val, HEATMAP_MAX) }}
                        title={`${DAYS_LABEL[ri]} ${HOURS_LABEL[ci]}: ${val} orders`}
                      />
                    ))}
                  </div>
                ))}
                {/* Legend */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[9px] text-text-secondary">Low</span>
                  <div className="flex gap-0.5">
                    {[0.1, 0.3, 0.5, 0.7, 0.9, 1].map((t) => (
                      <div key={t} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(255,${Math.round(87 + (1 - t) * 168)},${Math.round(34 + (1 - t) * 221)},${0.1 + t * 0.85})` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-text-secondary">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
