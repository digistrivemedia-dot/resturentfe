"use client";

import { useState, useEffect } from "react";
import {
  IndianRupee, TrendingUp, Clock, Calendar, Download,
  Building2, Edit2, Check, X, AlertCircle, FileText,
  ChevronDown, BadgeCheck, Info,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/utils";
import useRestaurantProfileStore from "@/stores/restaurantProfileStore";

// ── Mock Stats & Chart Data (kept as fallback — no backend analytics yet) ────
const STATS = [
  {
    label: "Total Earned (All Time)",
    value: "₹4,82,350",
    icon: IndianRupee,
    color: "text-success",
    bg: "bg-success-light",
    sub: "Since Jan 2024",
  },
  {
    label: "This Month",
    value: "₹38,720",
    icon: TrendingUp,
    color: "text-primary",
    bg: "bg-primary-50",
    sub: "+12% vs last month",
  },
  {
    label: "Pending Payout",
    value: "₹6,480",
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning-light",
    sub: "Expected 10 Jun 2026",
  },
  {
    label: "Last Payout Date",
    value: "3 Jun 2026",
    icon: Calendar,
    color: "text-info",
    bg: "bg-info-light",
    sub: "₹9,240 transferred",
  },
];

const WEEKS = [
  { label: "W1 Apr", earnings: 8200 },
  { label: "W2 Apr", earnings: 11500 },
  { label: "W3 Apr", earnings: 9800 },
  { label: "W4 Apr", earnings: 13200 },
  { label: "W1 May", earnings: 10400 },
  { label: "W2 May", earnings: 15600 },
  { label: "W3 May", earnings: 12800 },
  { label: "W4 May", earnings: 17300 },
];

const MAX_EARNINGS = Math.max(...WEEKS.map((w) => w.earnings));

const TAX_YEARS = ["FY 2025-26", "FY 2024-25", "FY 2023-24"];

const STATUS_STYLES = {
  paid:       { label: "Paid",       cls: "bg-green-100 text-green-700 border-green-200" },
  processing: { label: "Processing", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  pending:    { label: "Pending",    cls: "bg-gray-100 text-gray-600 border-gray-200" },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-xl flex items-center gap-2 animate-slide-up">
      <Check size={16} className="text-green-400" />
      {message}
      <button onClick={onClose} className="ml-2 hover:text-gray-300"><X size={14} /></button>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function EarningsChart() {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex items-end gap-2 h-40 pt-4">
      {WEEKS.map((w, i) => {
        const pct = (w.earnings / MAX_EARNINGS) * 100;
        const isLast = i === WEEKS.length - 1;
        const isHovered = hovered === i;

        return (
          <div
            key={w.label}
            className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1.5 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                ₹{w.earnings.toLocaleString("en-IN")}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
            <div
              className={`w-full rounded-t-[4px] transition-all duration-300 ${
                isLast ? "bg-gray-300" : isHovered ? "bg-[#FF5722]" : "bg-[#FF5722]/60"
              }`}
              style={{ height: `${pct}%`, minHeight: "6px" }}
            />
            <span className="text-[9px] font-medium text-text-tertiary text-center leading-tight">{w.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { payouts, isLoading, fetchPayouts } = useRestaurantProfileStore();

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolder: "Vikram Malhotra",
    accountNumber: "",
    ifsc: "HDFC0001234",
  });
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedYear, setSelectedYear] = useState(TAX_YEARS[0]);
  const [downloadingYear, setDownloadingYear] = useState(false);

  useEffect(() => {
    try {
      fetchPayouts();
    } catch (err) {
      // error stored in store
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerifyBank = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setVerifying(false);
    setVerified(true);
    setTimeout(() => {
      setBankModalOpen(false);
      setVerified(false);
      showToast("Bank account updated successfully!");
    }, 600);
  };

  const handleDownloadInvoice = (id) => {
    showToast(`Invoice ${id} downloaded`);
  };

  const handleDownloadTaxReport = async () => {
    setDownloadingYear(true);
    await new Promise((r) => setTimeout(r, 800));
    setDownloadingYear(false);
    showToast(`Tax report for ${selectedYear} downloaded`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Earnings & Payouts</h1>
        <p className="text-sm text-text-secondary mt-0.5">Track your revenue, payouts and financial details</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-4">
            <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xl font-extrabold text-text-primary">{value}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
            <p className="text-[10px] font-semibold text-text-tertiary mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Earnings chart */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-text-primary">Weekly Earnings</h2>
          <span className="text-xs text-text-tertiary">Last 8 weeks · Hover bar for value</span>
        </div>
        <p className="text-xs text-text-secondary mb-4">Platform fee and taxes not deducted in chart</p>
        <EarningsChart />
        <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-6">
          <div>
            <p className="text-xs text-text-tertiary">8-Week Total</p>
            <p className="text-base font-extrabold text-text-primary">
              ₹{WEEKS.reduce((s, w) => s + w.earnings, 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Weekly Average</p>
            <p className="text-base font-extrabold text-text-primary">
              ₹{Math.round(WEEKS.reduce((s, w) => s + w.earnings, 0) / WEEKS.length).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary">Best Week</p>
            <p className="text-base font-extrabold text-[#FF5722]">
              ₹{MAX_EARNINGS.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Payout history table */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary">Payout History</h2>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Paid
            <span className="w-2 h-2 rounded-full bg-yellow-400 ml-2" /> Processing
            <span className="w-2 h-2 rounded-full bg-gray-300 ml-2" /> Pending
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-[#FF5722]" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <IndianRupee size={32} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-text-primary">No payouts yet</p>
            <p className="text-xs text-text-secondary mt-1">Your payout history will appear here once payments are processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary border-b border-border-light">
                  {["Payout ID", "Period", "Gross Sales", "Platform Fee (10%)", "Tax (2%)", "Net Payout", "Status", "Paid On", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {payouts.map((row) => {
                  const s = STATUS_STYLES[row.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={row._id || row.id} className="hover:bg-bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{row.payoutId || row.id}</td>
                      <td className="px-4 py-3 text-xs text-text-primary whitespace-nowrap">{row.period}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-primary">₹{(row.gross || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-xs text-red-500">–₹{(row.fee || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-xs text-red-500">–₹{(row.tax || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-xs font-bold text-green-700">₹{(row.net || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">
                        {row.paidOn ? formatDate(row.paidOn) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "paid" && (
                          <button
                            onClick={() => handleDownloadInvoice(row._id || row.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                          >
                            <Download size={12} /> Invoice
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bottom two columns */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Bank account section */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-primary">Bank Account</h2>
            <button
              onClick={() => setBankModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Edit2 size={12} /> Update
            </button>
          </div>

          <div className="flex items-center gap-4 p-4 bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light">
            <div className="w-12 h-12 bg-blue-100 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary">HDFC Bank</p>
                <BadgeCheck size={15} className="text-green-500" />
              </div>
              <p className="text-sm font-mono text-text-secondary mt-0.5">A/C: •••• •••• 4521</p>
              <p className="text-xs text-text-tertiary mt-0.5">IFSC: HDFC0001234</p>
            </div>
          </div>

          <p className="text-xs text-text-tertiary mt-3 flex items-start gap-1.5">
            <Info size={12} className="shrink-0 mt-0.5" />
            Payouts are processed every Monday by 6 PM. Allow 1-2 business days for funds to reflect.
          </p>
        </div>

        {/* Tax section */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
          <h2 className="text-sm font-bold text-text-primary mb-4">Tax & Compliance</h2>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-[var(--radius-lg)]">
              <div>
                <p className="text-xs font-semibold text-text-secondary">GST Number</p>
                <p className="text-sm font-mono font-bold text-text-primary mt-0.5">27AAPCS1294F1ZY</p>
              </div>
              <BadgeCheck size={18} className="text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)]">
              <div>
                <p className="text-xs font-semibold text-amber-700">TDS Deduction</p>
                <p className="text-xs text-amber-600 mt-0.5">2% TDS applicable on payouts above ₹30,000 / month per Sec 194C</p>
              </div>
              <AlertCircle size={18} className="text-amber-500 shrink-0 ml-2" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 h-9 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 text-text-primary focus:outline-none focus:border-[#FF5722]"
            >
              {TAX_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={handleDownloadTaxReport}
              disabled={downloadingYear}
              className="flex items-center gap-2 h-9 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] hover:bg-[#e64a19] transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {downloadingYear ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <FileText size={13} />
              )}
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Bank Update Modal */}
      <Modal
        isOpen={bankModalOpen}
        onClose={() => { setBankModalOpen(false); setVerified(false); }}
        title="Update Bank Account"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)] flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Changing bank details requires re-verification. Payouts may be paused for up to 24 hours during review.
            </p>
          </div>

          {[
            { key: "accountHolder", label: "Account Holder Name", placeholder: "As per bank records" },
            { key: "accountNumber", label: "Account Number", placeholder: "Enter account number" },
            { key: "ifsc", label: "IFSC Code", placeholder: "e.g. HDFC0001234" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">{label}</label>
              <input
                type="text"
                value={bankForm[key]}
                onChange={(e) => setBankForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-10 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 text-sm text-text-primary focus:outline-none focus:border-[#FF5722]"
              />
            </div>
          ))}

          <button
            onClick={handleVerifyBank}
            disabled={verifying || verified}
            className="w-full h-10 bg-[#FF5722] text-white text-sm font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-[#e64a19] transition-colors disabled:opacity-70"
          >
            {verifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Verifying…
              </>
            ) : verified ? (
              <>
                <Check size={16} className="text-white" /> Verified!
              </>
            ) : (
              "Verify & Save"
            )}
          </button>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
