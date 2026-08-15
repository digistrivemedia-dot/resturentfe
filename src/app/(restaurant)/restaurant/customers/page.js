"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Download,
  Users,
  Repeat,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDate, timeAgo } from "@/lib/utils";
import useRestaurantCustomerStore from "@/stores/restaurantCustomerStore";

function getInitials(name) {
  if (!name || !name.trim()) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function RestaurantCustomersPage() {
  const { customers, pagination, isLoading, fetchCustomers, sendMembershipPopup } = useRestaurantCustomerStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sendingPopupId, setSendingPopupId] = useState(null);

  useEffect(() => {
    const params = { page, limit: 20 };
    if (search) params.search = search;
    fetchCustomers(params).catch((err) => {
      toast.error(err.response?.data?.message || "Failed to load customers");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const totalPages = pagination.pages ?? 1;
  const currentPage = page;
  const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;

  async function handleSendPopup(customer) {
    if (sendingPopupId) return;
    setSendingPopupId(customer._id);
    try {
      await sendMembershipPopup(customer._id);
      toast.success(`Membership popup sent to ${customer.name || customer.email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send popup");
    } finally {
      setSendingPopupId(null);
    }
  }

  function handleExportCSV() {
    const header = "Name,Email,Phone,Orders,Last Order";
    const rows = customers.map((c) =>
      [c.name, c.email, c.phone, c.totalOrders, c.lastOrderAt ? formatDate(c.lastOrderAt) : ""].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restaurant-customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Customers</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Everyone who has ordered from you, with a way to nudge them toward membership
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
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 bg-primary-50">
            <Users size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-text-primary leading-tight">{pagination.total ?? customers.length}</p>
            <p className="text-xs text-text-tertiary truncate">Total Customers</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 bg-success-light">
            <Repeat size={18} className="text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-text-primary leading-tight">{repeatCustomers}</p>
            <p className="text-xs text-text-tertiary truncate">Repeat (this page)</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors"
          />
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Orders Here</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Last Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wide">Action</th>
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
                    No customers found.
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
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-text-primary truncate">{customer.name}</p>
                            {customer.isMember && <Badge variant="primary">Member</Badge>}
                          </div>
                          <p className="text-xs text-text-tertiary truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{customer.phone}</td>
                    <td className="px-4 py-3 text-text-secondary font-medium">{customer.totalOrders ?? 0}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSendPopup(customer)}
                        disabled={sendingPopupId === customer._id}
                        title={customer.membershipPopupRequestedAt ? `Last sent ${timeAgo(customer.membershipPopupRequestedAt)}` : "Send membership popup"}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-semibold rounded-[var(--radius-md)] bg-warning-light text-warning hover:bg-warning hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Sparkles size={12} />
                        {sendingPopupId === customer._id ? "Sending..." : "Send Popup"}
                      </button>
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
            No customers found.
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
                {customer.isMember && <Badge variant="primary">Member</Badge>}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-text-tertiary">Phone</p>
                  <p className="text-text-primary font-medium mt-0.5">{customer.phone}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Orders</p>
                  <p className="text-text-primary font-medium mt-0.5">{customer.totalOrders ?? 0}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Last Order</p>
                  <p className="text-text-primary font-medium mt-0.5">
                    {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSendPopup(customer)}
                disabled={sendingPopupId === customer._id}
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 text-xs font-semibold rounded-[var(--radius-md)] bg-warning-light text-warning hover:bg-warning hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles size={13} />
                {sendingPopupId === customer._id
                  ? "Sending..."
                  : customer.membershipPopupRequestedAt
                    ? `Send Popup (last sent ${timeAgo(customer.membershipPopupRequestedAt)})`
                    : "Send Membership Popup"}
              </button>
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
    </div>
  );
}
