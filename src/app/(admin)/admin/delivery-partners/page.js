"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Users,
  UserCheck,
  Wifi,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  Star,
} from "lucide-react";
import { Modal, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

const MOCK_PARTNERS = [
  { _id: "dp_001", name: "Rahul Sharma",  phone: "9876512345", city: "Mumbai",    vehicle: "Motorcycle", vehicleNumber: "MH-01-AB-1234", status: "active",    rating: 4.8, totalOrders: 1240, earnings: 62000, joinedAt: "2026-01-10", documents: { dl: true,  rc: true,  insurance: true,  photo: true  }, online: true  },
  { _id: "dp_002", name: "Suresh Kumar",  phone: "9876523456", city: "Mumbai",    vehicle: "Motorcycle", vehicleNumber: "MH-02-CD-5678", status: "active",    rating: 4.5, totalOrders: 890,  earnings: 44500, joinedAt: "2026-01-25", documents: { dl: true,  rc: true,  insurance: true,  photo: true  }, online: true  },
  { _id: "dp_003", name: "Ajay Verma",    phone: "9876534567", city: "Pune",      vehicle: "Bicycle",    vehicleNumber: "N/A",           status: "active",    rating: 4.6, totalOrders: 520,  earnings: 26000, joinedAt: "2026-02-14", documents: { dl: true,  rc: false, insurance: false, photo: true  }, online: false },
  { _id: "dp_004", name: "Manoj Tiwari",  phone: "9876545678", city: "Delhi",     vehicle: "Motorcycle", vehicleNumber: "DL-01-EF-9012", status: "pending",   rating: 0,   totalOrders: 0,    earnings: 0,     joinedAt: "2026-06-05", documents: { dl: true,  rc: true,  insurance: false, photo: true  }, online: false },
  { _id: "dp_005", name: "Deepak Singh",  phone: "9876556789", city: "Bengaluru", vehicle: "Scooter",    vehicleNumber: "KA-01-GH-3456", status: "active",    rating: 4.2, totalOrders: 340,  earnings: 17000, joinedAt: "2026-03-01", documents: { dl: true,  rc: true,  insurance: true,  photo: true  }, online: true  },
  { _id: "dp_006", name: "Pradeep Yadav", phone: "9876567890", city: "Mumbai",    vehicle: "Motorcycle", vehicleNumber: "MH-03-IJ-7890", status: "suspended", rating: 3.1, totalOrders: 120,  earnings: 6000,  joinedAt: "2026-02-20", documents: { dl: true,  rc: true,  insurance: true,  photo: true  }, online: false },
  { _id: "dp_007", name: "Raju Prasad",   phone: "9876578901", city: "Chennai",   vehicle: "Bicycle",    vehicleNumber: "N/A",           status: "pending",   rating: 0,   totalOrders: 0,    earnings: 0,     joinedAt: "2026-06-06", documents: { dl: false, rc: false, insurance: false, photo: true  }, online: false },
  { _id: "dp_008", name: "Vikram Rao",    phone: "9876589012", city: "Bengaluru", vehicle: "Scooter",    vehicleNumber: "KA-02-KL-1234", status: "active",    rating: 4.7, totalOrders: 680,  earnings: 34000, joinedAt: "2026-02-05", documents: { dl: true,  rc: true,  insurance: true,  photo: true  }, online: true  },
];

const PAGE_SIZE = 8;

const AVATAR_COLORS = [
  "bg-[#6366f1]", "bg-[#0ea5e9]", "bg-[#10b981]",
  "bg-[#f59e0b]", "bg-[#ef4444]", "bg-[#8b5cf6]",
  "bg-[#ec4899]", "bg-[#14b8a6]",
];

const STATUS_CONFIG = {
  active:    { label: "Active",    variant: "success"  },
  pending:   { label: "Pending",   variant: "warning"  },
  suspended: { label: "Suspended", variant: "error"    },
};

const VEHICLE_TYPES = ["All", "Motorcycle", "Scooter", "Bicycle"];
const CITIES        = ["All", "Mumbai", "Pune", "Delhi", "Bengaluru", "Chennai"];

const DOCS_META = [
  { key: "dl",        label: "Driving Licence (DL)" },
  { key: "rc",        label: "Registration Certificate (RC)" },
  { key: "insurance", label: "Vehicle Insurance" },
  { key: "photo",     label: "Profile Photo" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(id) {
  const idx = parseInt(id.replace(/\D/g, ""), 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] ?? AVATAR_COLORS[0];
}

function StarRating({ rating }) {
  if (rating === 0) {
    return <span className="text-xs text-text-tertiary font-medium">New</span>;
  }
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={11} className="fill-warning text-warning" />
      ))}
      {half && <Star size={11} className="fill-warning/50 text-warning" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={11} className="text-border-default" />
      ))}
      <span className="ml-1 text-xs font-semibold text-text-secondary">{rating}</span>
    </span>
  );
}

function DocChips({ documents }) {
  const keys = ["dl", "rc", "insurance", "photo"];
  const labels = { dl: "DL", rc: "RC", insurance: "Ins", photo: "Photo" };
  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => (
        <span
          key={k}
          className={`inline-flex items-center h-5 px-1.5 text-[10px] font-semibold rounded-[var(--radius-full)] ${
            documents[k]
              ? "bg-success-light text-success-dark"
              : "bg-error-light text-error-dark"
          }`}
        >
          {labels[k]}
        </span>
      ))}
    </div>
  );
}

// ── action label/style helpers ─────────────────────────────────────────────────

function getActionConfig(status) {
  if (status === "pending")   return { label: "Approve",    bg: "bg-success-light text-success hover:bg-success hover:text-white",  action: "approve"    };
  if (status === "active")    return { label: "Suspend",    bg: "bg-error-light text-error hover:bg-error hover:text-white",        action: "suspend"    };
  if (status === "suspended") return { label: "Reactivate", bg: "bg-primary-50 text-primary hover:bg-primary hover:text-white",     action: "reactivate" };
  return null;
}

function getNextStatus(action) {
  if (action === "approve")    return "active";
  if (action === "suspend")    return "suspended";
  if (action === "reactivate") return "active";
  return null;
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function DeliveryPartnersPage() {
  const [partners, setPartners] = useState(MOCK_PARTNERS);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [cityFilter, setCityFilter]       = useState("All");
  const [page, setPage]                   = useState(1);

  // docs modal
  const [docsModal, setDocsModal]       = useState(null); // partner object
  // action confirm modal
  const [actionModal, setActionModal]   = useState(null); // { partner, action }
  const [acting, setActing]             = useState(false);

  // ── derived stats ──
  const totalActive  = partners.filter((p) => p.status === "active").length;
  const totalOnline  = partners.filter((p) => p.online).length;
  const totalPending = partners.filter((p) => p.status === "pending").length;

  // ── filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return partners.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.city.toLowerCase().includes(q);
      const matchStatus  = statusFilter === "all" || p.status === statusFilter;
      const matchVehicle = vehicleFilter === "All" || p.vehicle === vehicleFilter;
      const matchCity    = cityFilter    === "All" || p.city    === cityFilter;
      return matchSearch && matchStatus && matchVehicle && matchCity;
    });
  }, [partners, search, statusFilter, vehicleFilter, cityFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  // ── action handlers ──
  function openAction(partner) {
    const cfg = getActionConfig(partner.status);
    if (!cfg) return;
    setActionModal({ partner, action: cfg.action });
  }

  function closeAction() {
    if (!acting) setActionModal(null);
  }

  function confirmAction() {
    if (!actionModal || acting) return;
    setActing(true);
    const next = getNextStatus(actionModal.action);
    setTimeout(() => {
      setPartners((prev) =>
        prev.map((p) =>
          p._id === actionModal.partner._id ? { ...p, status: next } : p
        )
      );
      setActing(false);
      setActionModal(null);
    }, 800);
  }

  // ── stat chips ──
  const chips = [
    { label: "Total Partners", value: partners.length, icon: Users,      color: "text-primary",      bg: "bg-primary-50"     },
    { label: "Active",         value: totalActive,      icon: UserCheck,  color: "text-success",      bg: "bg-success-light"  },
    { label: "Online Now",     value: totalOnline,      icon: Wifi,       color: "text-success",      bg: "bg-success-light", pulse: true },
    { label: "Pending KYC",    value: totalPending,     icon: Clock,      color: "text-warning-dark", bg: "bg-warning-light"  },
  ];

  const selectClass =
    "h-9 px-3 pr-8 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none";
  const chevronBg = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "16px",
  };

  // ── action modal labels ──
  const actionCfg = actionModal ? getActionConfig(actionModal.partner.status) : null;
  const actionDestructive = actionModal?.action === "suspend";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Delivery Partners</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Manage delivery partner accounts, documents, and statuses
        </p>
      </div>

      {/* ── Stat chips ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3"
            >
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${chip.bg}`}>
                {chip.pulse ? (
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-4 h-4 rounded-full bg-success opacity-30 animate-ping" />
                    <Icon size={18} className={chip.color} />
                  </span>
                ) : (
                  <Icon size={18} className={chip.color} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-text-primary leading-tight">{chip.value}</p>
                <p className="text-xs text-text-tertiary truncate">{chip.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search name, phone, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-[var(--radius-md)]">
          {[
            { key: "all",       label: "All"       },
            { key: "active",    label: "Active"    },
            { key: "pending",   label: "Pending"   },
            { key: "suspended", label: "Suspended" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => { setStatusFilter(s.key); resetPage(); }}
              className={`h-7 px-3 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                statusFilter === s.key
                  ? "bg-white text-text-primary shadow-sm border border-border-light"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Vehicle filter */}
        <select
          value={vehicleFilter}
          onChange={(e) => { setVehicleFilter(e.target.value); resetPage(); }}
          className={selectClass}
          style={chevronBg}
        >
          {VEHICLE_TYPES.map((v) => (
            <option key={v} value={v}>{v === "All" ? "All Vehicles" : v}</option>
          ))}
        </select>

        {/* City filter */}
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); resetPage(); }}
          className={selectClass}
          style={chevronBg}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c === "All" ? "All Cities" : c}</option>
          ))}
        </select>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                {["Partner", "City", "Vehicle", "Status", "Online", "Rating", "Orders", "Earnings", "Documents", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-text-tertiary">
                    No delivery partners found matching your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((partner) => {
                  const statusCfg = STATUS_CONFIG[partner.status];
                  const actionCfgRow = getActionConfig(partner.status);
                  return (
                    <tr key={partner._id} className="hover:bg-bg-hover transition-colors">
                      {/* Partner */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(partner._id)}`}>
                            <span className="text-xs font-bold text-white">{getInitials(partner.name)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary whitespace-nowrap">{partner.name}</p>
                            <p className="text-xs text-text-tertiary">{partner.phone}</p>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3 whitespace-nowrap text-text-secondary">{partner.city}</td>

                      {/* Vehicle */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary whitespace-nowrap">{partner.vehicle}</p>
                        <p className="text-xs text-text-tertiary font-mono">{partner.vehicleNumber}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      </td>

                      {/* Online */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {partner.online ? (
                            <>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                              </span>
                              <span className="text-xs font-medium text-success">Online</span>
                            </>
                          ) : (
                            <>
                              <span className="h-2.5 w-2.5 rounded-full bg-text-tertiary" />
                              <span className="text-xs font-medium text-text-tertiary">Offline</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StarRating rating={partner.rating} />
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-text-primary">
                        {partner.totalOrders.toLocaleString("en-IN")}
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-text-primary">
                        {formatPrice(partner.earnings)}
                      </td>

                      {/* Documents */}
                      <td className="px-4 py-3">
                        <DocChips documents={partner.documents} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDocsModal(partner)}
                            className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover transition-colors cursor-pointer"
                          >
                            <FileText size={12} />
                            View Docs
                          </button>
                          {actionCfgRow && (
                            <button
                              onClick={() => openAction(partner)}
                              className={`inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${actionCfgRow.bg}`}
                            >
                              {actionCfgRow.action === "approve"    && <CheckCircle size={12} />}
                              {actionCfgRow.action === "suspend"    && <XCircle     size={12} />}
                              {actionCfgRow.action === "reactivate" && <CheckCircle size={12} />}
                              {actionCfgRow.label}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-12 text-center text-sm text-text-tertiary">
            No delivery partners found matching your filters.
          </div>
        ) : (
          paginated.map((partner) => {
            const statusCfg    = STATUS_CONFIG[partner.status];
            const actionCfgRow = getActionConfig(partner.status);
            return (
              <div key={partner._id} className="bg-white border border-border-light rounded-[var(--radius-xl)] p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(partner._id)}`}>
                      <span className="text-sm font-bold text-white">{getInitials(partner.name)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary truncate">{partner.name}</p>
                      <p className="text-xs text-text-tertiary">{partner.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    {partner.online ? (
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                        </span>
                        <span className="text-[10px] text-success font-medium">Online</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-text-tertiary" />
                        <span className="text-[10px] text-text-tertiary font-medium">Offline</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-text-tertiary">City</p>
                    <p className="text-text-primary font-medium mt-0.5">{partner.city}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Vehicle</p>
                    <p className="text-text-primary font-medium mt-0.5">{partner.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Rating</p>
                    <div className="mt-0.5"><StarRating rating={partner.rating} /></div>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Orders</p>
                    <p className="text-text-primary font-medium mt-0.5">{partner.totalOrders.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Earnings</p>
                    <p className="text-text-primary font-bold mt-0.5">{formatPrice(partner.earnings)}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary">Documents</p>
                    <div className="mt-0.5"><DocChips documents={partner.documents} /></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border-light">
                  <button
                    onClick={() => setDocsModal(partner)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover transition-colors cursor-pointer"
                  >
                    <FileText size={13} />
                    View Docs
                  </button>
                  {actionCfgRow && (
                    <button
                      onClick={() => openAction(partner)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${actionCfgRow.bg}`}
                    >
                      {actionCfgRow.action === "approve"    && <CheckCircle size={13} />}
                      {actionCfgRow.action === "suspend"    && <XCircle     size={13} />}
                      {actionCfgRow.action === "reactivate" && <CheckCircle size={13} />}
                      {actionCfgRow.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-text-tertiary">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} partners
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
              Prev
            </button>
            <span className="text-sm font-semibold text-text-primary px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 h-8 px-3 text-sm font-medium rounded-[var(--radius-md)] border border-border-light bg-white text-text-primary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── View Documents Modal ── */}
      <Modal
        isOpen={!!docsModal}
        onClose={() => setDocsModal(null)}
        title="Document Verification"
        size="sm"
        footer={
          <button
            onClick={() => setDocsModal(null)}
            className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        {docsModal && (
          <div className="space-y-4">
            {/* Partner identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-border-light">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(docsModal._id)}`}>
                <span className="text-sm font-bold text-white">{getInitials(docsModal.name)}</span>
              </div>
              <div>
                <p className="font-bold text-text-primary">{docsModal.name}</p>
                <p className="text-xs text-text-tertiary">{docsModal.city} &bull; {docsModal.vehicle}</p>
              </div>
            </div>

            {/* Doc rows */}
            <div className="space-y-2">
              {DOCS_META.map((doc) => {
                const verified = docsModal.documents[doc.key];
                return (
                  <div
                    key={doc.key}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-[var(--radius-lg)] border ${
                      verified ? "border-success-light bg-success-light/40" : "border-error-light bg-error-light/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {verified ? (
                        <CheckCircle size={16} className="text-success shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-error shrink-0" />
                      )}
                      <span className="text-sm font-medium text-text-primary truncate">{doc.label}</span>
                    </div>
                    {verified ? (
                      <span className="text-xs font-semibold text-success whitespace-nowrap">Verified</span>
                    ) : (
                      <button className="inline-flex items-center gap-1 h-6 px-2 text-xs font-semibold rounded-[var(--radius-md)] bg-white border border-border-default text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer whitespace-nowrap">
                        <Upload size={11} />
                        Upload
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Approve / Suspend / Reactivate Confirm Modal ── */}
      <Modal
        isOpen={!!actionModal}
        onClose={closeAction}
        title={
          actionModal?.action === "approve"
            ? `Approve ${actionModal?.partner?.name}?`
            : actionModal?.action === "suspend"
            ? `Suspend ${actionModal?.partner?.name}?`
            : `Reactivate ${actionModal?.partner?.name}?`
        }
        size="sm"
        footer={
          <>
            <button
              onClick={closeAction}
              disabled={acting}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={acting}
              className={`h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] text-white transition-opacity cursor-pointer disabled:opacity-60 ${
                actionModal?.action === "suspend"
                  ? "bg-error hover:opacity-90"
                  : "bg-success hover:opacity-90"
              }`}
            >
              {acting
                ? "Please wait..."
                : actionModal?.action === "approve"
                ? "Yes, Approve"
                : actionModal?.action === "suspend"
                ? "Yes, Suspend"
                : "Yes, Reactivate"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {actionModal?.action === "approve" &&
            `${actionModal?.partner?.name} will be approved as an active delivery partner and can start accepting orders.`}
          {actionModal?.action === "suspend" &&
            `${actionModal?.partner?.name} will be suspended and won't be able to accept any orders. You can reactivate them later.`}
          {actionModal?.action === "reactivate" &&
            `${actionModal?.partner?.name} will be reactivated and can resume accepting delivery orders on the platform.`}
        </p>
      </Modal>
    </div>
  );
}
