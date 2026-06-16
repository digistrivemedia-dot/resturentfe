"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Info,
  Activity,
  Clock,
  User,
  Server,
  Tag,
  Calendar,
} from "lucide-react";
import { timeAgo, formatDate } from "@/lib/utils";
import useAdminLogStore from "@/stores/adminLogStore";

const CATEGORIES = ["all", "auth", "restaurant", "order", "finance", "customer", "system", "coupon"];
const SEVERITIES = ["all", "info", "warning", "critical"];
const PAGE_SIZE = 15;

// ─── Badge components ─────────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  auth:       "bg-purple-100 text-purple-700",
  restaurant: "bg-orange-100 text-orange-700",
  order:      "bg-blue-100 text-blue-700",
  finance:    "bg-green-100 text-green-700",
  customer:   "bg-pink-100 text-pink-700",
  system:     "bg-gray-100 text-gray-700",
  coupon:     "bg-yellow-100 text-yellow-700",
};

const SEVERITY_STYLES = {
  info:     "bg-blue-100 text-blue-700",
  warning:  "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-700",
};

const ROLE_STYLES = {
  superadmin: "bg-[#FF5722] text-white",
  system:     "bg-gray-200 text-gray-700",
};

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${CATEGORY_STYLES[category] || "bg-gray-100 text-gray-600"}`}>
      {category}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const icons = { info: <Info size={11} />, warning: <AlertTriangle size={11} />, critical: <Shield size={11} /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${SEVERITY_STYLES[severity] || ""}`}>
      {icons[severity]}
      {severity}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${ROLE_STYLES[role] || "bg-gray-200 text-gray-600"}`}>
      {role === "superadmin" ? "SA" : "SYS"}
    </span>
  );
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────

function StatsStrip({ logs }) {
  const today = new Date().toDateString();
  // Support both API shape (createdAt) and legacy shape (timestamp)
  const getTs = (l) => l.createdAt || l.timestamp;
  const todayLogs = logs.filter((l) => new Date(getTs(l)).toDateString() === today);
  const critical = logs.filter((l) => l.severity === "critical").length;
  const warnings = logs.filter((l) => l.severity === "warning").length;
  const latest = logs.length > 0
    ? logs.reduce((a, b) => (new Date(getTs(a)) > new Date(getTs(b)) ? a : b), logs[0])
    : null;

  const chips = [
    { label: "Total Logs (Today)", value: todayLogs.length, icon: <Activity size={16} />, color: "text-[#FF5722]" },
    { label: "Critical Events", value: critical, icon: <Shield size={16} />, color: "text-red-600" },
    { label: "Warnings", value: warnings, icon: <AlertTriangle size={16} />, color: "text-yellow-600" },
    { label: "Last Activity", value: latest ? timeAgo(getTs(latest)) : "—", icon: <Clock size={16} />, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {chips.map((chip) => (
        <div key={chip.label} className="bg-bg-primary border border-border-light rounded-[var(--radius-lg)] px-4 py-3 flex items-center gap-3">
          <span className={chip.color}>{chip.icon}</span>
          <div>
            <p className="text-[11px] text-text-secondary leading-none mb-1">{chip.label}</p>
            <p className={`text-lg font-bold leading-none ${chip.color}`}>{chip.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const { logs, pagination, isLoading, fetchLogs } = useAdminLogStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [dateRange, setDateRange] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  // Helper to get timestamp from either API shape or legacy
  const getTs = (l) => l.createdAt || l.timestamp;

  // Fetch logs on mount and when filters change
  useEffect(() => {
    const params = { page, limit: PAGE_SIZE };
    if (category !== "all") params.entity = category;
    if (customFrom) params.startDate = customFrom;
    if (customTo) params.endDate = customTo;
    try {
      fetchLogs(params);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  }, [fetchLogs, page, category, customFrom, customTo]);

  // Auto-refresh logic
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        const params = { page: 1, limit: PAGE_SIZE };
        if (category !== "all") params.entity = category;
        try {
          fetchLogs(params);
        } catch (err) {
          console.error("Auto-refresh failed", err);
        }
      }, 30000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, category, fetchLogs]);

  // Client-side date range helper (applied on top of API results for quick filtering)
  const isInRange = useCallback(
    (timestamp) => {
      const d = new Date(timestamp);
      const now = new Date();
      if (dateRange === "today") {
        return d.toDateString() === now.toDateString();
      }
      if (dateRange === "7d") {
        return d >= new Date(now.getTime() - 7 * 86400000);
      }
      if (dateRange === "30d") {
        return d >= new Date(now.getTime() - 30 * 86400000);
      }
      if (dateRange === "custom") {
        const from = customFrom ? new Date(customFrom) : null;
        const to = customTo ? new Date(customTo + "T23:59:59") : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      }
      return true;
    },
    [dateRange, customFrom, customTo]
  );

  // Normalise API log shape to the shape the UI expects
  const normalisedLogs = useMemo(() => {
    return logs.map((l) => ({
      ...l,
      // Map API fields to UI fields, falling back gracefully
      actor: l.admin
        ? { name: l.admin.name || l.admin.email || "Admin", role: "superadmin" }
        : l.actor || { name: "System", role: "system" },
      action: l.action,
      target: l.target || { type: l.entity || "System", name: l.entityId || "—" },
      category: l.entity || l.category || "system",
      severity: l.severity || "info",
      timestamp: l.createdAt || l.timestamp,
      ipAddress: l.ipAddress || "—",
      details: l.details
        ? typeof l.details === "object"
          ? JSON.stringify(l.details)
          : l.details
        : "—",
    }));
  }, [logs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return normalisedLogs.filter((l) => {
      const matchSearch =
        !q ||
        (l.actor?.name || "").toLowerCase().includes(q) ||
        (l.action || "").toLowerCase().includes(q) ||
        (l.target?.name || "").toLowerCase().includes(q) ||
        (l.target?.type || "").toLowerCase().includes(q);
      const matchCategory = category === "all" || l.category === category;
      const matchSeverity = severity === "all" || l.severity === severity;
      const matchDate = isInRange(l.timestamp);
      return matchSearch && matchCategory && matchSeverity && matchDate;
    });
  }, [normalisedLogs, search, category, severity, isInRange]);

  // Use server pagination total when available, fall back to client count
  const totalFromServer = pagination?.total ?? filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFromServer / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  // Data is already paginated by the server; client-side slice is just for local filter
  const paginated = filtered;

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, category, severity, dateRange, customFrom, customTo]);

  const toggleExpand = (logId) => setExpanded((prev) => (prev === logId ? null : logId));

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = ["ID", "Timestamp", "Actor", "Role", "Action", "Target Type", "Target Name", "Category", "Severity", "IP Address", "Details"];
    const rows = filtered.map((l) => [
      l._id || l.id,
      new Date(l.timestamp).toLocaleString("en-IN"),
      l.actor?.name ?? "—",
      l.actor?.role ?? "—",
      l.action,
      l.target?.type ?? "—",
      l.target?.name ?? "—",
      l.category,
      l.severity,
      l.ipAddress,
      `"${String(l.details).replace(/"/g, "'")}"`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Row tint ────────────────────────────────────────────────────────────────
  const rowBg = (log) => {
    if (log.severity === "critical") return "bg-red-50";
    if (log.severity === "warning") return "bg-yellow-50";
    return "bg-bg-primary";
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-4 sm:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity size={20} className="text-[#FF5722]" />
            Activity Logs
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {totalFromServer} {totalFromServer === 1 ? "entry" : "entries"} found
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors ${
              autoRefresh
                ? "border-green-400 text-green-700 bg-green-50"
                : "border-border-light text-text-secondary bg-bg-primary hover:bg-bg-secondary"
            }`}
          >
            {autoRefresh ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            ) : (
              <RefreshCw size={14} />
            )}
            Auto-refresh {autoRefresh ? "On" : "Off"}
          </button>
          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[#FF5722] text-white text-sm font-medium hover:bg-[#e64a19] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <StatsStrip logs={normalisedLogs} />

      {/* ── Filters ── */}
      <div className="bg-bg-primary border border-border-light rounded-[var(--radius-xl)] p-4 mb-4 space-y-3">
        {/* Row 1: Search + Severity */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search actor, action, target…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border-light rounded-[var(--radius-md)] bg-bg-secondary text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
            />
          </div>
          {/* Severity */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold capitalize border transition-colors ${
                  severity === s
                    ? s === "all"
                      ? "bg-[#FF5722] text-white border-[#FF5722]"
                      : s === "critical"
                      ? "bg-red-600 text-white border-red-600"
                      : s === "warning"
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : "bg-blue-600 text-white border-blue-600"
                    : "bg-bg-secondary text-text-secondary border-border-light hover:border-gray-300"
                }`}
              >
                {s === "all" ? "All Severity" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text-secondary mr-1 flex items-center gap-1">
            <Tag size={12} /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold capitalize border transition-colors ${
                category === cat
                  ? "bg-[#FF5722] text-white border-[#FF5722]"
                  : "bg-bg-secondary text-text-secondary border-border-light hover:border-gray-300"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* Row 3: Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <Calendar size={12} /> Date:
          </span>
          {[
            { key: "today", label: "Today" },
            { key: "7d", label: "Last 7 days" },
            { key: "30d", label: "Last 30 days" },
            { key: "all", label: "All time" },
            { key: "custom", label: "Custom" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold border transition-colors ${
                dateRange === key
                  ? "bg-[#FF5722] text-white border-[#FF5722]"
                  : "bg-bg-secondary text-text-secondary border-border-light hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
          {dateRange === "custom" && (
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="text-xs border border-border-light rounded-[var(--radius-md)] px-2 py-1.5 bg-bg-secondary text-text-primary focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              />
              <span className="text-text-secondary text-xs">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="text-xs border border-border-light rounded-[var(--radius-md)] px-2 py-1.5 bg-bg-secondary text-text-primary focus:outline-none focus:ring-1 focus:ring-[#FF5722]"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-bg-primary border border-border-light rounded-[var(--radius-xl)] overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap">IP Address</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-secondary text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-border-light border-t-[#FF5722] animate-spin" />
                      Loading logs…
                    </span>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-text-secondary text-sm">
                    No log entries match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((log) => (
                  <>
                    <tr
                      key={log._id || log.id}
                      onClick={() => toggleExpand(log._id || log.id)}
                      className={`border-b border-border-light cursor-pointer hover:brightness-95 transition-all ${rowBg(log)}`}
                    >
                      {/* Time */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-text-primary">{timeAgo(log.timestamp)}</div>
                        <div className="text-[10px] text-text-secondary">
                          {new Date(log.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      {/* Actor */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#FF5722]/10 flex items-center justify-center text-[10px] font-bold text-[#FF5722] shrink-0">
                            {log.actor.role === "system" ? <Server size={12} /> : log.actor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-text-primary leading-none">{log.actor.name}</div>
                            <div className="mt-0.5">
                              <RoleBadge role={log.actor.role} />
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-2">
                        <span className="text-xs font-medium text-text-primary">{log.action}</span>
                      </td>
                      {/* Target */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-xs text-text-secondary leading-none mb-0.5">{log.target.type}</div>
                        <div className="text-xs font-medium text-text-primary">{log.target.name}</div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <CategoryBadge category={log.category} />
                      </td>
                      {/* Severity */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <SeverityBadge severity={log.severity} />
                      </td>
                      {/* IP */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-text-secondary">{log.ipAddress}</span>
                      </td>
                      {/* Expand icon */}
                      <td className="px-3 py-2 text-text-secondary">
                        {expanded === (log._id || log.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {/* Expanded row */}
                    {expanded === (log._id || log.id) && (
                      <tr key={`${log._id || log.id}-exp`} className={`border-b border-border-light ${rowBg(log)}`}>
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-start gap-3 bg-white/60 border border-border-light rounded-[var(--radius-md)] px-4 py-3">
                            <Info size={15} className="text-[#FF5722] mt-0.5 shrink-0" />
                            <div className="space-y-1.5 text-xs">
                              <p className="font-semibold text-text-primary">Details</p>
                              <p className="text-text-secondary leading-relaxed">{log.details}</p>
                              <div className="flex flex-wrap gap-4 mt-2 text-[11px] text-text-secondary">
                                <span><span className="font-semibold text-text-primary">Log ID:</span> {log._id || log.id}</span>
                                <span><span className="font-semibold text-text-primary">Timestamp:</span> {new Date(log.timestamp).toLocaleString("en-IN")}</span>
                                <span><span className="font-semibold text-text-primary">IP:</span> {log.ipAddress}</span>
                                <span><span className="font-semibold text-text-primary">Actor Role:</span> {log.actor.role}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-text-secondary">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalFromServer)} of {totalFromServer} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-[var(--radius-md)] border border-border-light text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary text-sm">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 rounded-[var(--radius-md)] text-xs font-semibold border transition-colors ${
                      currentPage === item
                        ? "bg-[#FF5722] text-white border-[#FF5722]"
                        : "border-border-light text-text-secondary hover:bg-bg-secondary"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-[var(--radius-md)] border border-border-light text-text-secondary hover:bg-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
