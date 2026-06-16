"use client";

import { useState } from "react";
import { TrendingUp, ShoppingBag, Users, BarChart2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MONTHLY_DATA = [
  { month: "Jan", gmv: 2840000, orders: 3420, newCustomers: 820,  newRestaurants: 3, retention: 72 },
  { month: "Feb", gmv: 3120000, orders: 3890, newCustomers: 940,  newRestaurants: 4, retention: 74 },
  { month: "Mar", gmv: 3680000, orders: 4520, newCustomers: 1120, newRestaurants: 6, retention: 71 },
  { month: "Apr", gmv: 4240000, orders: 5180, newCustomers: 1380, newRestaurants: 5, retention: 75 },
  { month: "May", gmv: 5080000, orders: 6240, newCustomers: 1680, newRestaurants: 7, retention: 78 },
  { month: "Jun", gmv: 3910000, orders: 4820, newCustomers: 1240, newRestaurants: 2, retention: 76 },
];

const CITY_DATA = [
  { city: "Mumbai",    orders: 8420, gmv: 6840000, restaurants: 24, customers: 8420, share: 38 },
  { city: "Pune",      orders: 4180, gmv: 3240000, restaurants: 12, customers: 4180, share: 19 },
  { city: "Bengaluru", orders: 5640, gmv: 4520000, restaurants: 18, customers: 5640, share: 26 },
  { city: "Delhi",     orders: 2840, gmv: 2180000, restaurants: 8,  customers: 2840, share: 13 },
  { city: "Chennai",   orders: 820,  gmv: 620000,  restaurants: 4,  customers: 820,  share: 4  },
];

const TOP_RESTAURANTS = [
  { rank: 1, name: "Tandoori Nights",  city: "Mumbai",    orders: 1250, gmv: 624800, rating: 4.3, growth: "+18%" },
  { rank: 2, name: "Pizza Paradise",   city: "Mumbai",    orders: 890,  gmv: 441800, rating: 4.1, growth: "+12%" },
  { rank: 3, name: "Sushi World",      city: "Bengaluru", orders: 320,  gmv: 198400, rating: 4.5, growth: "+24%" },
  { rank: 4, name: "Burger Bay",       city: "Pune",      orders: 560,  gmv: 238000, rating: 4.0, growth: "+8%"  },
  { rank: 5, name: "Green Bowl",       city: "Bengaluru", orders: 180,  gmv: 68400,  rating: 3.8, growth: "-5%"  },
];

// ─── Chart dimensions ─────────────────────────────────────────────────────────

const CW  = 460;
const CH  = 220;
const CP  = { top: 16, right: 14, bottom: 36, left: 48 };
const CIW = CW - CP.left - CP.right;
const CIH = CH - CP.top  - CP.bottom;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function polyline(pts) { return pts.map((p) => `${p.x},${p.y}`).join(" "); }
function areaPath(pts) {
  const base = CP.top + CIH;
  return `M ${pts[0].x} ${base} L ${polyline(pts)} L ${pts[pts.length - 1].x} ${base} Z`;
}

function buildLinePoints(values) {
  const max = Math.max(...values) * 1.08;
  return {
    max,
    pts: values.map((v, i) => ({
      x: CP.left + (i / (values.length - 1)) * CIW,
      y: CP.top + CIH - (v / max) * CIH,
      v,
    })),
  };
}

function formatLakhs(v) {
  const l = v / 100000;
  return l >= 1 ? `₹${l.toFixed(1)}L` : formatPrice(v);
}

// ─── Chart: GMV Line ─────────────────────────────────────────────────────────

function GmvLineChart() {
  const { max, pts } = buildLinePoints(MONTHLY_DATA.map((d) => d.gmv));
  const yLabels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="h-[220px] w-full min-w-[360px]" role="img" aria-label="GMV growth line chart">
        <defs>
          <linearGradient id="agGmv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {yLabels.map((r) => {
          const y   = CP.top + CIH * r;
          const val = max * (1 - r);
          return (
            <g key={r}>
              <line x1={CP.left} x2={CP.left + CIW} y1={y} y2={y} stroke="var(--border-light)" strokeWidth="1" />
              <text x={CP.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">
                {formatLakhs(val)}
              </text>
            </g>
          );
        })}

        <path d={areaPath(pts)} fill="url(#agGmv)" />
        <polyline points={polyline(pts)} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {pts.map((p, i) => (
          <g key={MONTHLY_DATA[i].month}>
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill="var(--primary)" />
            <text x={p.x} y={CH - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">
              {MONTHLY_DATA[i].month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Chart: Order Volume Bars ─────────────────────────────────────────────────

function OrderBarChart() {
  const values = MONTHLY_DATA.map((d) => d.orders);
  const max    = Math.max(...values) * 1.12;
  const barW   = CIW / values.length;
  const barGap = barW * 0.22;
  const bw     = barW - barGap;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="h-[220px] w-full min-w-[360px]" role="img" aria-label="Order volume bar chart">
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = CP.top + CIH * r;
          return (
            <g key={r}>
              <line x1={CP.left} x2={CP.left + CIW} y1={y} y2={y} stroke="var(--border-light)" strokeWidth="1" />
              <text x={CP.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">
                {Math.round(max * (1 - r))}
              </text>
            </g>
          );
        })}

        {values.map((v, i) => {
          const barH = (v / max) * CIH;
          const bx   = CP.left + i * barW + barGap / 2;
          const by   = CP.top + CIH - barH;
          return (
            <g key={MONTHLY_DATA[i].month}>
              <rect x={bx} y={by} width={bw} height={barH} rx="4" fill="var(--success)" opacity="0.85" />
              <text x={bx + bw / 2} y={by - 4} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="600">
                {v.toLocaleString("en-IN")}
              </text>
              <text x={bx + bw / 2} y={CH - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">
                {MONTHLY_DATA[i].month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Chart: User Acquisition (bars + line overlay) ───────────────────────────

function UserAcquisitionChart() {
  const custVals = MONTHLY_DATA.map((d) => d.newCustomers);
  const restVals = MONTHLY_DATA.map((d) => d.newRestaurants);
  const maxCust  = Math.max(...custVals) * 1.12;
  const maxRest  = Math.max(...restVals) * 1.2;
  const barW     = CIW / custVals.length;
  const barGap   = barW * 0.22;
  const bw       = barW - barGap;

  const restPts = restVals.map((v, i) => ({
    x: CP.left + i * barW + bw / 2 + barGap / 2,
    y: CP.top + CIH - (v / maxRest) * CIH,
    v,
  }));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="h-[220px] w-full min-w-[360px]" role="img" aria-label="User acquisition chart">
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = CP.top + CIH * r;
          return (
            <g key={r}>
              <line x1={CP.left} x2={CP.left + CIW} y1={y} y2={y} stroke="var(--border-light)" strokeWidth="1" />
              <text x={CP.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">
                {Math.round(maxCust * (1 - r))}
              </text>
            </g>
          );
        })}

        {/* Customer bars */}
        {custVals.map((v, i) => {
          const barH = (v / maxCust) * CIH;
          const bx   = CP.left + i * barW + barGap / 2;
          const by   = CP.top + CIH - barH;
          return (
            <g key={MONTHLY_DATA[i].month}>
              <rect x={bx} y={by} width={bw} height={barH} rx="4" fill="var(--primary)" opacity="0.75" />
              <text x={bx + bw / 2} y={CH - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">
                {MONTHLY_DATA[i].month}
              </text>
            </g>
          );
        })}

        {/* Restaurant line overlay */}
        <polyline
          points={restPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#FF9800"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5,3"
        />
        {restPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#FF9800" />
        ))}
      </svg>
    </div>
  );
}

// ─── Chart: Retention Horizontal Bars ────────────────────────────────────────

function RetentionChart() {
  const barH    = 24;
  const barGap  = 10;
  const padLeft = 32;
  const padTop  = 10;
  const svgH    = padTop * 2 + MONTHLY_DATA.length * (barH + barGap);
  const maxW    = 300;

  function retentionColor(v) {
    if (v >= 76) return "var(--success)";
    if (v >= 72) return "var(--warning)";
    return "var(--error)";
  }

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${padLeft + maxW + 60} ${svgH}`}
        className={`w-full min-w-[300px]`}
        style={{ height: `${svgH}px` }}
        role="img"
        aria-label="Retention rate horizontal bar chart"
      >
        {MONTHLY_DATA.map((d, i) => {
          const by  = padTop + i * (barH + barGap);
          const bw  = (d.retention / 100) * maxW;
          const col = retentionColor(d.retention);
          return (
            <g key={d.month}>
              <text x={padLeft - 6} y={by + barH / 2 + 4} textAnchor="end" fontSize="11" fill="var(--text-tertiary)">
                {d.month}
              </text>
              <rect x={padLeft} y={by} width={maxW} height={barH} rx="6" fill="var(--bg-secondary)" />
              <rect x={padLeft} y={by} width={bw} height={barH} rx="6" fill={col} opacity="0.8" />
              <text x={padLeft + bw + 6} y={by + barH / 2 + 4} fontSize="11" fontWeight="700" fill={col}>
                {d.retention}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ value }) {
  const full  = Math.floor(value);
  const half  = value - full >= 0.3;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5 text-xs">
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} style={{ color: "var(--rating-star)" }}>★</span>)}
      {half && <span style={{ color: "var(--rating-star)" }}>½</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-text-tertiary">★</span>)}
      <span className="text-text-secondary ml-1 font-semibold">{value.toFixed(1)}</span>
    </span>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-7 h-7 rounded-full bg-bg-secondary flex items-center justify-center text-xs font-bold text-text-secondary">
      {rank}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DATE_RANGES = ["Last 30 days", "Last 3 months", "Last 6 months"];

export default function AnalyticsPage() {
  const [range, setRange] = useState("Last 6 months");

  const totalGmv      = MONTHLY_DATA.reduce((s, d) => s + d.gmv, 0);
  const totalOrders   = MONTHLY_DATA.reduce((s, d) => s + d.orders, 0);
  const avgRetention  = (MONTHLY_DATA.reduce((s, d) => s + d.retention, 0) / MONTHLY_DATA.length).toFixed(1);

  const kpis = [
    {
      label: "Total GMV",
      value: formatLakhs(totalGmv),
      sub: "6-month cumulative",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success-light",
      subColor: "text-success",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString("en-IN"),
      sub: "across all cities",
      icon: ShoppingBag,
      color: "text-primary",
      bg: "bg-primary-50",
      subColor: "text-primary",
    },
    {
      label: "Avg Monthly Growth",
      value: "+14.2%",
      sub: "GMV month-over-month",
      icon: BarChart2,
      color: "text-success",
      bg: "bg-success-light",
      subColor: "text-success",
    },
    {
      label: "Retention Rate",
      value: `${avgRetention}%`,
      sub: "avg across 6 months",
      icon: Users,
      color: "text-info",
      bg: "bg-info-light",
      subColor: "text-info",
    },
  ];

  // Sort city data by GMV desc
  const sortedCities = [...CITY_DATA].sort((a, b) => b.gmv - a.gmv);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Platform Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Growth metrics, city breakdown, and restaurant performance.
          </p>
        </div>
        {/* Date range selector */}
        <div className="flex items-center bg-bg-secondary rounded-[var(--radius-full)] p-1 gap-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-semibold transition-colors whitespace-nowrap ${
                range === r
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center ${k.bg} mb-4`}>
                <Icon size={19} className={k.color} />
              </div>
              <p className="text-xl font-extrabold text-text-primary">{k.value}</p>
              <p className="text-xs text-text-tertiary mt-0.5">{k.label}</p>
              <p className={`text-[11px] font-semibold mt-1 ${k.subColor}`}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* 2x2 Charts Grid */}
      <div className="grid xl:grid-cols-2 gap-6">

        {/* GMV Growth */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-text-primary">GMV Growth</h2>
            <p className="text-xs text-text-tertiary">Monthly gross merchandise value in ₹L</p>
          </div>
          <GmvLineChart />
          <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
            <span className="w-3 h-0.5 bg-primary rounded-full inline-block" />
            GMV (₹L)
          </div>
        </section>

        {/* Order Volume */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-text-primary">Order Volume</h2>
            <p className="text-xs text-text-tertiary">Total orders placed per month</p>
          </div>
          <OrderBarChart />
          <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
            <span className="w-3 h-3 rounded-sm bg-success opacity-85 inline-block" />
            Orders
          </div>
        </section>

        {/* User Acquisition */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-text-primary">User Acquisition</h2>
            <p className="text-xs text-text-tertiary">New customers (bars) and new restaurants (dashed line)</p>
          </div>
          <UserAcquisitionChart />
          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary opacity-75 inline-block" />
              New Customers
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-warning inline-block" />
              New Restaurants
            </span>
          </div>
        </section>

        {/* Retention Rate */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-text-primary">Retention Rate</h2>
            <p className="text-xs text-text-tertiary">Monthly customer retention % (green ≥76%, yellow ≥72%)</p>
          </div>
          <RetentionChart />
        </section>
      </div>

      {/* City-wise Breakdown */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary">City-wise Breakdown</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Sorted by GMV — all-time platform data</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                {["City", "Orders", "GMV", "Restaurants", "Customers", "Market Share"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {sortedCities.map((c) => (
                <tr key={c.city} className="hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                    {c.city}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                    {c.orders.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                    {formatLakhs(c.gmv)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                    {c.restaurants}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                    {c.customers.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${c.share}%`, opacity: 0.85 }}
                        />
                      </div>
                      <span className="text-xs font-bold text-text-primary w-8 text-right shrink-0">
                        {c.share}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Restaurants Leaderboard */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-border-light">
          <h2 className="text-base font-bold text-text-primary">Top Restaurants Leaderboard</h2>
          <p className="text-xs text-text-tertiary mt-0.5">Ranked by orders — all-time performance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                {["Rank", "Restaurant", "Orders", "GMV", "Rating", "Growth"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {TOP_RESTAURANTS.map((r) => {
                const isPositive = r.growth.startsWith("+");
                return (
                  <tr key={r.rank} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8">
                        <RankBadge rank={r.rank} />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                      <p className="text-xs text-text-tertiary">{r.city}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {r.orders.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                      {formatPrice(r.gmv)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StarRating value={r.rating} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-sm font-bold ${isPositive ? "text-success-dark" : "text-error"}`}
                      >
                        {isPositive ? "↑" : "↓"} {r.growth}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
