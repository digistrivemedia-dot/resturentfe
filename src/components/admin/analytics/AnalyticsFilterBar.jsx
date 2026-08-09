"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { DATE_PRESETS } from "@/lib/analyticsDateRanges";
import useAdminAnalyticsStore from "@/stores/adminAnalyticsStore";

const ORDER_TYPES = [
  { value: "all", label: "All order types" },
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
  { value: "dine_in", label: "Dine-in" },
  { value: "self_service", label: "Self Service" },
];

const PAYMENT_METHODS = [
  { value: "all", label: "All payment methods" },
  { value: "online", label: "Online" },
  { value: "cod", label: "Cash on Delivery" },
];

function Select({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 px-3 text-xs font-semibold border border-border-light rounded-[var(--radius-md)] bg-white text-text-primary focus:outline-none focus:border-primary ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export default function AnalyticsFilterBar({ onExport, exportLabel = "Export CSV" }) {
  const { filters, setFilters, filterOptions, fetchFilterOptions } = useAdminAnalyticsStore();

  useEffect(() => {
    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-border-light rounded-[var(--radius-xl)] p-3 flex flex-wrap items-center gap-2">
      <Select
        value={filters.preset}
        onChange={(v) => setFilters({ preset: v })}
        options={DATE_PRESETS.map((p) => ({ value: p, label: p }))}
      />

      {filters.preset === "Custom" && (
        <>
          <input
            type="date"
            value={filters.customStart}
            onChange={(e) => setFilters({ customStart: e.target.value })}
            className="h-9 px-2 text-xs border border-border-light rounded-[var(--radius-md)] text-text-primary"
          />
          <span className="text-xs text-text-tertiary">to</span>
          <input
            type="date"
            value={filters.customEnd}
            onChange={(e) => setFilters({ customEnd: e.target.value })}
            className="h-9 px-2 text-xs border border-border-light rounded-[var(--radius-md)] text-text-primary"
          />
        </>
      )}

      <Select
        value={filters.city}
        onChange={(v) => setFilters({ city: v, restaurantId: "all" })}
        options={[{ value: "all", label: "All cities" }, ...(filterOptions?.cities || []).map((c) => ({ value: c, label: c }))]}
      />

      <Select
        value={filters.restaurantId}
        onChange={(v) => setFilters({ restaurantId: v })}
        options={[
          { value: "all", label: "All restaurants" },
          ...(filterOptions?.restaurants || [])
            .filter((r) => filters.city === "all" || r.city === filters.city)
            .map((r) => ({ value: r.id, label: r.name })),
        ]}
      />

      <Select
        value={filters.orderType}
        onChange={(v) => setFilters({ orderType: v })}
        options={ORDER_TYPES}
      />

      <Select
        value={filters.paymentMethod}
        onChange={(v) => setFilters({ paymentMethod: v })}
        options={PAYMENT_METHODS}
      />

      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.compare}
          onChange={(e) => setFilters({ compare: e.target.checked })}
          className="accent-primary"
        />
        Compare to previous period
      </label>

      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.includeCancelled}
          onChange={(e) => setFilters({ includeCancelled: e.target.checked })}
          className="accent-primary"
        />
        Include cancelled orders
      </label>

      {onExport && (
        <button
          onClick={onExport}
          className="ml-auto flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors"
        >
          <Download size={13} /> {exportLabel}
        </button>
      )}
    </div>
  );
}
