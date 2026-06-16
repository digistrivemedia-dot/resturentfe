"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Users,
  UserCheck,
  UserX,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Modal, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import useAdminCustomerStore from "@/stores/adminCustomerStore";

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function CustomersPage() {
  const {
    customers,
    pagination,
    isLoading,
    isSaving,
    fetchCustomers,
    blockCustomer,
  } = useAdminCustomerStore();

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);
  const [modal, setModal]             = useState(null); // { customer, action }

  // Fetch whenever filters/page change
  useEffect(() => {
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;

    try {
      fetchCustomers(params);
    } catch (_) {}
  }, [search, statusFilter, page]);

  const totalActive  = customers.filter((c) => c.status === "active").length;
  const totalBlocked = customers.filter((c) => c.status === "blocked").length;

  const totalPages  = pagination.pages ?? 1;
  const currentPage = page;

  function openModal(customer) {
    setModal({ customer, action: customer.status === "active" ? "block" : "unblock" });
  }

  function closeModal() {
    if (!isSaving) setModal(null);
  }

  async function handleToggle() {
    if (!modal || isSaving) return;
    try {
      await blockCustomer(modal.customer._id);
      setModal(null);
    } catch (_) {}
  }

  function handleExportCSV() {
    const header = "Name,Email,Phone,Orders,Status";
    const rows = customers.map((c) =>
      [c.name, c.email, c.phone, c.orders ?? "", c.status].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const statChips = [
    { label: "Total Customers", value: pagination.total ?? customers.length, icon: Users,       color: "text-primary",  bg: "bg-primary-50" },
    { label: "Active",          value: totalActive,                           icon: UserCheck,   color: "text-success",  bg: "bg-success-light" },
    { label: "Blocked",         value: totalBlocked,                          icon: UserX,       color: "text-error",    bg: "bg-error-light" },
    { label: "Total Revenue",   value: "—",                                   icon: IndianRupee, color: "text-warning",  bg: "bg-warning-light" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Customers</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage all registered customers on the platform
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover transition-colors cursor-pointer"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statChips.map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3"
            >
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${chip.bg}`}>
                <Icon size={18} className={chip.color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-text-primary leading-tight">{chip.value}</p>
                <p className="text-xs text-text-tertiary truncate">{chip.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-[var(--radius-md)]">
          {["all", "active", "blocked"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`h-7 px-3 text-xs font-semibold rounded-[var(--radius-md)] capitalize transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-white text-text-primary shadow-sm border border-border-light"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-bg-secondary">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide w-10">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-text-tertiary">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-text-tertiary">
                    No customers found matching your filters.
                  </td>
                </tr>
              ) : (
                customers.map((customer, idx) => (
                  <tr key={customer._id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 text-xs text-text-tertiary">
                      {(currentPage - 1) * 20 + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">{getInitials(customer.name)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary truncate">{customer.name}</p>
                          <p className="text-xs text-text-tertiary truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{customer.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant={customer.status === "active" ? "success" : "error"} dot>
                        {customer.status === "active" ? "Active" : "Blocked"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer._id}`}
                          className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                        <button
                          onClick={() => openModal(customer)}
                          className={`inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                            customer.status === "active"
                              ? "bg-error-light text-error hover:bg-error hover:text-white"
                              : "bg-success-light text-success hover:bg-success hover:text-white"
                          }`}
                        >
                          {customer.status === "active" ? <Ban size={12} /> : <CheckCircle size={12} />}
                          {customer.status === "active" ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-12 text-center text-sm text-text-tertiary">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-12 text-center text-sm text-text-tertiary">
            No customers found matching your filters.
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer._id} className="bg-white border border-border-light rounded-[var(--radius-xl)] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{getInitials(customer.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-text-primary truncate">{customer.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{customer.email}</p>
                  </div>
                </div>
                <Badge variant={customer.status === "active" ? "success" : "error"} dot>
                  {customer.status === "active" ? "Active" : "Blocked"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-text-tertiary">Phone</p>
                  <p className="text-text-primary font-medium mt-0.5">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Joined</p>
                  <p className="text-text-primary font-medium mt-0.5">{formatDate(customer.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-border-light">
                <Link
                  href={`/admin/customers/${customer._id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] bg-primary-50 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Eye size={13} />
                  View Profile
                </Link>
                <button
                  onClick={() => openModal(customer)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] transition-colors cursor-pointer ${
                    customer.status === "active"
                      ? "bg-error-light text-error hover:bg-error hover:text-white"
                      : "bg-success-light text-success hover:bg-success hover:text-white"
                  }`}
                >
                  {customer.status === "active" ? <Ban size={13} /> : <CheckCircle size={13} />}
                  {customer.status === "active" ? "Block" : "Unblock"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-text-tertiary">
            Showing {Math.min((currentPage - 1) * 20 + 1, pagination.total)}–{Math.min(currentPage * 20, pagination.total)} of {pagination.total} customers
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

      {/* Block / Unblock confirm modal */}
      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal?.action === "block" ? `Block ${modal?.customer?.name}?` : `Unblock ${modal?.customer?.name}?`}
        size="sm"
        footer={
          <>
            <button
              onClick={closeModal}
              disabled={isSaving}
              className="h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className={`h-9 px-4 text-sm font-semibold rounded-[var(--radius-md)] text-white transition-colors cursor-pointer disabled:opacity-60 ${
                modal?.action === "block"
                  ? "bg-error hover:bg-error-dark"
                  : "bg-success hover:bg-success-dark"
              }`}
            >
              {isSaving
                ? "Please wait..."
                : modal?.action === "block"
                ? "Yes, Block"
                : "Yes, Unblock"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          {modal?.action === "block"
            ? `${modal?.customer?.name} won't be able to place orders on the platform. You can unblock them at any time.`
            : `${modal?.customer?.name} will regain full access to place orders on the platform.`}
        </p>
      </Modal>
    </div>
  );
}
