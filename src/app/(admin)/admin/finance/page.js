"use client";

import { useState } from "react";
import {
  Download,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const WEEKLY_REVENUE = [
  { week: "W1 Apr", gmv: 285000, commission: 42750, payouts: 38000 },
  { week: "W2 Apr", gmv: 312000, commission: 46800, payouts: 41200 },
  { week: "W3 Apr", gmv: 298000, commission: 44700, payouts: 39800 },
  { week: "W4 Apr", gmv: 341000, commission: 51150, payouts: 46000 },
  { week: "W1 May", gmv: 368000, commission: 55200, payouts: 49500 },
  { week: "W2 May", gmv: 392000, commission: 58800, payouts: 52000 },
  { week: "W3 May", gmv: 415000, commission: 62250, payouts: 55800 },
  { week: "W4 May", gmv: 448000, commission: 67200, payouts: 60100 },
  { week: "W1 Jun", gmv: 471000, commission: 70650, payouts: 62900 },
  { week: "W2 Jun", gmv: 498000, commission: 74700, payouts: 67200 },
  { week: "W3 Jun", gmv: 524000, commission: 78600, payouts: 70400 },
  { week: "W4 Jun", gmv: 391000, commission: 58650, payouts: 52100 },
];

const INITIAL_RESTAURANT_PAYOUTS = [
  { _id: "rest_001", name: "Tandoori Nights",  city: "Mumbai",    pendingAmount: 18420, lastPayout: "2026-06-01", lastPayoutAmount: 62400, totalEarnings: 624800, status: "pending"   },
  { _id: "rest_002", name: "Pizza Paradise",   city: "Mumbai",    pendingAmount: 12800, lastPayout: "2026-06-01", lastPayoutAmount: 44100, totalEarnings: 441800, status: "pending"   },
  { _id: "rest_003", name: "Burger Bay",       city: "Pune",      pendingAmount: 7240,  lastPayout: "2026-05-25", lastPayoutAmount: 23600, totalEarnings: 238000, status: "pending"   },
  { _id: "rest_004", name: "Sushi World",      city: "Bengaluru", pendingAmount: 9820,  lastPayout: "2026-06-01", lastPayoutAmount: 19600, totalEarnings: 198400, status: "pending"   },
  { _id: "rest_005", name: "Spice Garden",     city: "Pune",      pendingAmount: 0,     lastPayout: "—",          lastPayoutAmount: 0,     totalEarnings: 0,      status: "new"       },
  { _id: "rest_006", name: "Green Bowl",       city: "Bengaluru", pendingAmount: 3480,  lastPayout: "2026-05-15", lastPayoutAmount: 6800,  totalEarnings: 68400,  status: "suspended" },
];

const RECENT_TRANSACTIONS = [
  { _id: "tx_001", type: "payout",     restaurant: "Tandoori Nights", amount: 62400, date: "2026-06-01", reference: "PAY-2026-0601-001", status: "completed" },
  { _id: "tx_002", type: "payout",     restaurant: "Pizza Paradise",  amount: 44100, date: "2026-06-01", reference: "PAY-2026-0601-002", status: "completed" },
  { _id: "tx_003", type: "commission", restaurant: "Sushi World",     amount: 78600, date: "2026-06-05", reference: "COM-2026-0605-001", status: "completed" },
  { _id: "tx_004", type: "refund",     restaurant: "Tandoori Nights", amount: 541,   date: "2026-06-04", reference: "REF-2026-0604-001", status: "completed" },
  { _id: "tx_005", type: "payout",     restaurant: "Burger Bay",      amount: 23600, date: "2026-05-25", reference: "PAY-2026-0525-001", status: "completed" },
];

// ─── Chart constants ──────────────────────────────────────────────────────────

const CW = 760;
const CH = 260;
const CP = { top: 20, right: 20, bottom: 38, left: 50 };
const CI_W = CW - CP.left - CP.right;
const CI_H = CH - CP.top - CP.bottom;

const CHART_TABS = [
  { key: "gmv",        label: "GMV",        color: "var(--primary)",  gradId: "finGmv"  },
  { key: "commission", label: "Commission", color: "var(--success)",  gradId: "finComm" },
  { key: "payouts",    label: "Payouts",    color: "var(--warning)",  gradId: "finPay"  },
];

function buildPoints(key) {
  const max = Math.max(...WEEKLY_REVENUE.map((d) => d[key]));
  return { max, points: WEEKLY_REVENUE.map((d, i) => ({
    ...d,
    x: CP.left + (i / (WEEKLY_REVENUE.length - 1)) * CI_W,
    y: CP.top + CI_H - (d[key] / max) * CI_H,
  }))};
}

function polyline(pts) { return pts.map((p) => `${p.x},${p.y}`).join(" "); }
function areaPath(pts) {
  const base = CP.top + CI_H;
  return `M ${pts[0].x} ${base} L ${polyline(pts)} L ${pts[pts.length - 1].x} ${base} Z`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  pending:   "bg-warning-light text-warning-dark",
  new:       "bg-bg-secondary text-text-secondary",
  suspended: "bg-error-light text-error-dark",
};

const TX_TYPE_BADGE = {
  payout:     "bg-primary-50 text-primary",
  commission: "bg-success-light text-success-dark",
  refund:     "bg-error-light text-error-dark",
};

// ─── RevenueChart ─────────────────────────────────────────────────────────────

function RevenueChart() {
  const [tab, setTab] = useState("gmv");
  const meta = CHART_TABS.find((t) => t.key === tab);
  const { max, points } = buildPoints(tab);
  const total = WEEKLY_REVENUE.reduce((s, d) => s + d[tab], 0);

  return (
    <section className="bg-white rounded-[var(--radius-xl)] border border-border-light p-4 md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Revenue Chart</h2>
          <p className="text-xs text-text-tertiary">12-week trend across all restaurants</p>
        </div>
        <div className="flex items-center gap-2">
          {/* tab switcher */}
          <div className="flex items-center bg-bg-secondary rounded-[var(--radius-lg)] p-1 gap-1">
            {CHART_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] transition-colors ${
                  tab === t.key
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* period total */}
          <div className="text-right">
            <p className="text-[10px] text-text-tertiary">12-week total</p>
            <p className="text-sm font-extrabold" style={{ color: meta.color }}>
              {formatPrice(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          className="h-[260px] w-full min-w-[580px]"
          aria-label={`${meta.label} 12-week trend chart`}
          role="img"
        >
          <defs>
            {CHART_TABS.map((t) => (
              <linearGradient key={t.gradId} id={t.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={t.color} stopOpacity="0.22" />
                <stop offset="95%" stopColor={t.color} stopOpacity="0"    />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines + y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = CP.top + CI_H * ratio;
            const val = max * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={CP.left} x2={CP.left + CI_W}
                  y1={y}       y2={y}
                  stroke="var(--border-light)" strokeWidth="1"
                />
                <text x={CP.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--text-tertiary)">
                  ₹{Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Gradient fill */}
          <path d={areaPath(points)} fill={`url(#${meta.gradId})`} />

          {/* Line */}
          <polyline
            points={polyline(points)}
            fill="none"
            stroke={meta.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots + x-axis labels */}
          {points.map((p, i) => (
            <g key={p.week}>
              <circle
                cx={p.x} cy={p.y}
                r={i === points.length - 1 ? 5 : 3.5}
                fill={meta.color}
              />
              <text
                x={p.x}
                y={CH - 8}
                textAnchor="middle"
                fontSize="10"
                fill="var(--text-tertiary)"
              >
                {p.week}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

// ─── Process Payout Modal ─────────────────────────────────────────────────────

function PayoutModal({ restaurant, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  function handleConfirm() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        onConfirm(restaurant._id);
        onClose();
      }, 800);
    }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-warning-light flex items-center justify-center">
            <IndianRupee size={19} className="text-warning-dark" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Process Payout</h3>
            <p className="text-xs text-text-tertiary">Confirm transfer to restaurant</p>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-[var(--radius-lg)] p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Restaurant</span>
            <span className="font-semibold text-text-primary">{restaurant.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">City</span>
            <span className="font-medium text-text-primary">{restaurant.city}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border-light pt-2 mt-2">
            <span className="text-text-secondary font-semibold">Payout Amount</span>
            <span className="font-extrabold text-warning-dark text-base">
              {formatPrice(restaurant.pendingAmount)}
            </span>
          </div>
        </div>

        {done ? (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-success">
            <CheckCircle2 size={18} />
            Payout processed successfully
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[var(--radius-lg)] border border-border-default text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-[var(--radius-lg)] bg-warning text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Processing…
                </>
              ) : (
                "Confirm & Process"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [payouts, setPayouts]       = useState(INITIAL_RESTAURANT_PAYOUTS);
  const [modal, setModal]           = useState(null); // restaurant object or null

  const totalPending = payouts.reduce((s, r) => s + r.pendingAmount, 0);

  function handleConfirmPayout(id) {
    setPayouts((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, pendingAmount: 0, lastPayout: "2026-06-06", lastPayoutAmount: r.pendingAmount }
          : r
      )
    );
  }

  function handleProcessAll() {
    const first = payouts.find((r) => r.pendingAmount > 0 && r.status === "pending");
    if (first) setModal(first);
  }

  const stats = [
    {
      label: "Total GMV (All Time)",
      value: "₹72.4L",
      sub: "+18.2% this month",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success-light",
      subColor: "text-success",
    },
    {
      label: "Commission Earned",
      value: "₹10.9L",
      sub: "15% avg take rate",
      icon: IndianRupee,
      color: "text-primary",
      bg: "bg-primary-50",
      subColor: "text-primary",
    },
    {
      label: "Pending Payouts",
      value: formatPrice(totalPending),
      sub: `${payouts.filter((r) => r.pendingAmount > 0 && r.status === "pending").length} restaurants waiting`,
      icon: Clock,
      color: "text-warning-dark",
      bg: "bg-warning-light",
      subColor: "text-warning-dark",
    },
    {
      label: "Processed This Month",
      value: "₹2,34,500",
      sub: "June 2026",
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success-light",
      subColor: "text-success",
    },
  ];

  return (
    <>
      {modal && (
        <PayoutModal
          restaurant={modal}
          onClose={() => setModal(null)}
          onConfirm={handleConfirmPayout}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary">Revenue &amp; Payouts</h1>
            <p className="text-sm text-text-secondary mt-1">
              Track platform GMV, commissions, and restaurant payout status.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] border border-border-default text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors w-fit">
            <Download size={15} />
            Download Report
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
                <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center ${s.bg} mb-4`}>
                  <Icon size={19} className={s.color} />
                </div>
                <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{s.label}</p>
                <p className={`text-[11px] font-semibold mt-1 ${s.subColor}`}>{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <RevenueChart />

        {/* Payout Table */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-border-light flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Restaurant Payouts</h2>
              <p className="text-xs text-text-tertiary">Pending and processed payout status per restaurant</p>
            </div>
            <button
              onClick={handleProcessAll}
              className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-warning-light text-warning-dark text-sm font-bold hover:opacity-90 transition-opacity w-fit"
            >
              <IndianRupee size={14} />
              Process All Pending
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border-light bg-bg-secondary">
                  {["Restaurant", "City", "Pending Amount", "Last Payout", "Last Amount", "Total Earnings", "Status", "Actions"].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {payouts.map((r) => {
                  const canProcess = r.status === "pending" && r.pendingAmount > 0;
                  return (
                    <tr key={r._id} className="hover:bg-bg-hover transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                        {r.city}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.pendingAmount > 0 ? (
                          <span className="text-sm font-bold text-warning-dark">
                            {formatPrice(r.pendingAmount)}
                          </span>
                        ) : (
                          <span className="text-sm text-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                        {r.lastPayout}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                        {r.lastPayoutAmount > 0 ? formatPrice(r.lastPayoutAmount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                        {r.totalEarnings > 0 ? formatPrice(r.totalEarnings) : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_BADGE[r.status] || "bg-bg-secondary text-text-secondary"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          disabled={!canProcess}
                          onClick={() => canProcess && setModal(r)}
                          className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-colors ${
                            canProcess
                              ? "bg-primary-50 text-primary hover:bg-primary hover:text-white"
                              : "bg-bg-secondary text-text-tertiary cursor-not-allowed"
                          }`}
                        >
                          Process Payout
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transaction Log */}
        <section className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 md:px-5 py-4 border-b border-border-light">
            <h2 className="text-base font-bold text-text-primary">Transaction Log</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Recent payouts, commissions, and refunds</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border-light bg-bg-secondary">
                  {["Type", "Restaurant", "Amount", "Date", "Reference", "Status"].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {RECENT_TRANSACTIONS.map((tx) => (
                  <tr key={tx._id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${TX_TYPE_BADGE[tx.type] || "bg-bg-secondary text-text-secondary"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {tx.restaurant}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary whitespace-nowrap">
                      {formatPrice(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-[var(--radius-md)]">
                        {tx.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success-dark bg-success-light px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
