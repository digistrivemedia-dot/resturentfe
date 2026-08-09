"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

// ── Shared SVG chart primitives ─────────────────────────────────────────────
// Extracted from what used to be duplicated across the overview/sales/orders/
// items mock pages — one implementation, reused everywhere.

const W = 500, H = 160, PAD = 20;

function toX(i, total) {
  return PAD + (i / (total - 1 || 1)) * (W - PAD * 2);
}
function toY(v, min, max) {
  return H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
}

function EmptyChart() {
  return (
    <div className="h-[160px] flex items-center justify-center text-xs text-text-tertiary">
      No data for this period
    </div>
  );
}

function AxisLabels({ labels }) {
  if (!labels || labels.length === 0 || labels.length > 20) return null;
  return (
    <div className="flex justify-between mt-1 px-[20px]">
      {labels.map((l, i) => (
        <span key={i} className="text-[10px] text-text-secondary truncate max-w-[48px]">{l}</span>
      ))}
    </div>
  );
}

export function LineChart({ data, labels, color = "#FF5722" }) {
  if (!data || data.length === 0) return <EmptyChart />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [toX(i, data.length), toY(v, min, max)]);
  const points = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath = `M ${pts[0][0]},${H - PAD} L ${pts.map(([x, y]) => `${x},${y}`).join(" L ")} L ${pts[pts.length - 1][0]},${H - PAD} Z`;
  const gradId = `analytics-grad-${color.replace("#", "")}`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <AxisLabels labels={labels} />
    </div>
  );
}

export function BarChart({ data, labels, color = "#2563EB", highlightColor = "#FF5722", highlightLast = true }) {
  if (!data || data.length === 0) return <EmptyChart />;
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 1);
  const barW = Math.max(Math.floor((W - PAD * 2) / data.length) - 4, 1);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full">
        {data.map((v, i) => {
          const bh = ((v - min) / (max - min || 1)) * (H - PAD * 2);
          const x = PAD + i * ((W - PAD * 2) / data.length) + 2;
          const y = H - PAD - bh;
          const isLast = highlightLast && i === data.length - 1;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={Math.max(bh, 0)}
              rx="4"
              fill={isLast ? highlightColor : color}
              opacity={isLast ? 1 : 0.75}
            />
          );
        })}
      </svg>
      <AxisLabels labels={labels} />
    </div>
  );
}

// Day-of-week (Mongo $dayOfWeek: 1=Sunday..7=Saturday) x hour-of-day heatmap
const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function intensityColor(val, max) {
  if (max === 0) return "rgba(255,87,34,0.06)";
  const t = Math.min(val / max, 1);
  return `rgba(255,87,34,${0.08 + t * 0.82})`;
}

export function Heatmap({ cells }) {
  // cells: [{ dow, hour, orders }]
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;
  (cells || []).forEach(({ dow, hour, orders }) => {
    if (dow >= 1 && dow <= 7 && hour >= 0 && hour <= 23) {
      grid[dow - 1][hour] = orders;
      if (orders > max) max = orders;
    }
  });
  // Reorder rows Mon..Sun for a more natural weekly read, keep Sun last
  const rowOrder = [1, 2, 3, 4, 5, 6, 0];

  if (max === 0) return <EmptyChart />;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-0.5 mb-1 ml-8">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center text-[8px] text-text-tertiary">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {rowOrder.map((dowIdx) => (
          <div key={dowIdx} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-7 text-[10px] text-text-secondary shrink-0">{DOW_LABELS[dowIdx]}</span>
            {grid[dowIdx].map((v, h) => (
              <div
                key={h}
                title={`${DOW_LABELS[dowIdx]} ${h}:00 — ${v} orders`}
                className="flex-1 aspect-square rounded-[2px]"
                style={{ backgroundColor: intensityColor(v, max) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Shared new-vs-returning split bar — used on both the Order Insights and
// Customer Insights pages, which each surface this metric from a different angle.
export function NewVsReturningBar({ newCount, returningCount }) {
  const total = newCount + returningCount;
  if (total === 0) return <p className="text-xs text-text-tertiary">No orders in this period</p>;
  return (
    <div className="flex h-6 rounded-[var(--radius-sm)] overflow-hidden">
      <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(newCount / total) * 100}%` }}>
        {newCount > 0 && `New ${newCount}`}
      </div>
      <div className="bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white" style={{ width: `${(returningCount / total) * 100}%` }}>
        {returningCount > 0 && `Returning ${returningCount}`}
      </div>
    </div>
  );
}

export function KpiCard({ label, value, sub, changePct, icon: Icon, color, bg }) {
  const showTrend = changePct !== null && changePct !== undefined;
  const isUp = changePct > 0;
  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${bg} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        {showTrend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(changePct)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-text-primary">{value}</p>
      <p className="text-xs font-medium text-text-secondary mt-1">{label}</p>
      {sub && <p className="text-xs text-text-secondary mt-0.5 opacity-70">{sub}</p>}
    </div>
  );
}
