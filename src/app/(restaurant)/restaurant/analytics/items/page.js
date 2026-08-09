"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Package, Award, ThumbsDown, MessageSquareWarning, Loader2, AlertCircle,
  IndianRupee, Trophy, X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { exportToCsv } from "@/lib/csvExport";
import useRestaurantAnalyticsStore from "@/stores/restaurantAnalyticsStore";
import useMenuManagementStore from "@/stores/menuManagementStore";
import AnalyticsFilterBar from "@/components/restaurant/analytics/AnalyticsFilterBar";
import { KpiCard } from "@/components/analytics/charts";
import { Modal, SearchInput, VegBadge } from "@/components/ui";

export default function ItemPerformance() {
  const { items, itemsLoading, fetchItems, filters, error } = useRestaurantAnalyticsStore();
  const { categories, fetchCategories } = useMenuManagementStore();
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleExport = () => {
    if (!items?.allItems) return;
    exportToCsv(
      "item-performance",
      items.allItems.map((i) => ({
        Item: i.name,
        Category: i.category,
        "Qty Sold": i.qty,
        Revenue: i.revenue,
        Complaints: i.complaints,
        "Complaint Rate %": i.complaintRatePct ?? "",
        Available: i.isAvailable ? "Yes" : "No",
      }))
    );
  };

  // Top sellers first, always — matches the page's purpose of surfacing what to act on
  const sortedItems = useMemo(() => {
    if (!items?.allItems) return [];
    return [...items.allItems].sort((a, b) => b.qty - a.qty);
  }, [items]);

  const visibleItems = useMemo(() => {
    if (!search.trim()) return sortedItems;
    const q = search.trim().toLowerCase();
    return sortedItems.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [sortedItems, search]);

  if (!items && itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-[#FF5722] animate-spin" />
      </div>
    );
  }

  const totalUnitsSold = items?.allItems.reduce((s, i) => s + i.qty, 0) || 0;
  const bestSeller = items?.topSellers?.[0];
  const highestRevenue = items?.topByRevenue?.[0];
  const mostComplainedItem = items?.mostComplained?.[0];
  const zeroSaleItems = items?.allItems.filter((i) => i.qty === 0) || [];
  const maxCatRevenue = items?.categoryBreakdown?.length ? Math.max(...items.categoryBreakdown.map((c) => c.revenue)) : 1;

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Item Performance</h1>
          <p className="text-sm text-text-secondary mt-0.5">Best sellers, worst sellers & complaint signals</p>
        </div>

        <AnalyticsFilterBar categories={categories} onExport={handleExport} exportLabel="Export item table" />

        {error && (
          <div className="flex items-center gap-2 text-sm text-error bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3">
            <AlertCircle size={15} /> Couldn&apos;t load item analytics.
          </div>
        )}

        {items && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Total Units Sold" value={totalUnitsSold.toLocaleString("en-IN")} icon={Package} color="text-blue-600" bg="bg-blue-50" sub="Summed across all items" />
              <KpiCard label="Best Seller" value={bestSeller?.qty > 0 ? bestSeller.name : "—"} icon={Award} color="text-amber-600" bg="bg-amber-50" sub={bestSeller?.qty > 0 ? `${bestSeller.qty} sold` : undefined} />
              <KpiCard label="Highest Revenue" value={highestRevenue?.revenue > 0 ? highestRevenue.name : "—"} icon={IndianRupee} color="text-emerald-600" bg="bg-emerald-50" sub={highestRevenue?.revenue > 0 ? formatPrice(highestRevenue.revenue) : undefined} />
              <KpiCard label="Most Complained" value={mostComplainedItem ? mostComplainedItem.name : "None 🎉"} icon={MessageSquareWarning} color="text-red-500" bg="bg-red-50" sub={mostComplainedItem ? `${mostComplainedItem.complaints} complaints` : undefined} />
            </div>

            {/* Zero-sale alert */}
            {zeroSaleItems.length > 0 && (
              <div className="bg-white rounded-[var(--radius-xl)] border border-red-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown size={15} className="text-red-500" />
                  <h2 className="text-sm font-bold text-text-primary">Not Selling At All ({zeroSaleItems.length})</h2>
                </div>
                <p className="text-xs text-text-secondary mb-4">Active menu items with zero orders in this period — consider a promo, repositioning, or removal.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {zeroSaleItems.map((item, idx) => (
                    <ItemCard key={item.menuItem} item={item} rank={idx + 1} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Category breakdown */}
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <h2 className="text-sm font-bold text-text-primary mb-4">Revenue by Category</h2>
              {items.categoryBreakdown.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-6">No sales in this period</p>
              ) : (
                <div className="space-y-2.5">
                  {items.categoryBreakdown.map((c) => (
                    <div key={c.category} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-text-secondary w-28 shrink-0 truncate">{c.category}</span>
                      <div className="flex-1 h-6 bg-bg-secondary rounded-[var(--radius-sm)] overflow-hidden">
                        <div className="h-full bg-[#FF5722] rounded-[var(--radius-sm)] flex items-center justify-end px-2" style={{ width: `${(c.revenue / maxCatRevenue) * 100}%` }}>
                          <span className="text-[10px] font-bold text-white">{formatPrice(c.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item cards */}
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-bold text-text-primary">All Items — top sellers first ({visibleItems.length})</h2>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch("")}
                  placeholder="Search items…"
                  className="w-full sm:w-64"
                />
              </div>

              {visibleItems.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-10">No items match &quot;{search}&quot;</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {visibleItems.map((item, idx) => (
                    <ItemCard key={item.menuItem} item={item} rank={idx + 1} onClick={() => setSelectedItem(item)} />
                  ))}
                </div>
              )}
            </div>

            {/* Addon attach rate */}
            {items.addonAttachRate.length > 0 && (
              <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
                <h2 className="text-sm font-bold text-text-primary mb-4">Most Popular Addons</h2>
                <div className="flex flex-wrap gap-2">
                  {items.addonAttachRate.map((a) => (
                    <span key={a.addon} className="text-xs font-semibold text-text-primary bg-bg-secondary px-2.5 py-1.5 rounded-full">
                      {a.addon} <span className="text-text-tertiary">× {a.qty}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

function ItemCard({ item, rank, onClick }) {
  const isTopSeller = rank <= 3 && item.qty > 0;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-[var(--radius-xl)] border overflow-hidden hover:shadow-md transition-all p-4 relative ${
        item.qty === 0 ? "border-border-light opacity-70" : "border-border-light hover:border-[#FF5722]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {isTopSeller && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-amber-500 px-1.5 py-0.5 rounded-full shrink-0">
              <Trophy size={10} /> #{rank}
            </span>
          )}
          {item.isVeg !== undefined && <VegBadge isVeg={item.isVeg} />}
        </div>
        {!item.isAvailable && (
          <span className="text-[10px] font-bold text-white bg-gray-500 px-2 py-0.5 rounded-full shrink-0">Unavailable</span>
        )}
      </div>

      <p className="text-sm font-bold text-text-primary truncate">{item.name}</p>
      <p className="text-xs text-text-tertiary truncate">{item.category}</p>

      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="text-sm font-bold text-text-primary">{formatPrice(item.discountedPrice || item.price)}</span>
        {hasDiscount && <span className="text-xs text-text-tertiary line-through">{formatPrice(item.price)}</span>}
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-border-light">
        <div>
          <p className="text-[10px] text-text-tertiary">Qty Sold</p>
          <p className="text-sm font-bold text-text-primary">{item.qty}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-text-tertiary">Revenue</p>
          <p className="text-sm font-bold text-[#FF5722]">{formatPrice(item.revenue)}</p>
        </div>
        {item.complaints > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-text-tertiary">Complaints</p>
            <p className="text-sm font-bold text-red-600 flex items-center gap-1 justify-end">
              <MessageSquareWarning size={11} /> {item.complaints}
            </p>
          </div>
        )}
      </div>
    </button>
  );
}

function ItemDetailModal({ item, onClose }) {
  if (!item) return null;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <Modal isOpen={!!item} onClose={onClose} size="md" showClose={false} className="!p-0">
      <div className="relative">
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-bg-secondary rounded-full flex items-center justify-center hover:bg-bg-hover transition-colors">
          <X size={16} className="text-text-primary" />
        </button>

        <div className="p-5 pt-12 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              {item.isVeg !== undefined && <VegBadge isVeg={item.isVeg} />}
              <h2 className="text-lg font-bold text-text-primary">{item.name}</h2>
              {item.isBestseller && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Bestseller</span>}
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">{item.category}</p>
            {item.description && <p className="text-sm text-text-secondary mt-2 leading-relaxed">{item.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-text-primary">{formatPrice(item.discountedPrice || item.price)}</span>
            {hasDiscount && <span className="text-sm text-text-tertiary line-through">{formatPrice(item.price)}</span>}
            {!item.isAvailable && <span className="text-xs font-bold text-white bg-gray-700 px-2 py-0.5 rounded-full ml-auto">Unavailable</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Qty Sold" value={item.qty} />
            <StatBox label="Revenue" value={formatPrice(item.revenue)} />
            <StatBox label="Complaints" value={item.complaints} tone={item.complaints > 0 ? "error" : undefined} />
            <StatBox label="Complaint Rate" value={item.complaintRatePct !== null ? `${item.complaintRatePct}%` : "—"} tone={item.complaintRatePct > 5 ? "error" : undefined} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function StatBox({ label, value, tone }) {
  return (
    <div className={`rounded-[var(--radius-lg)] border px-3 py-2.5 ${tone === "error" ? "bg-red-50 border-red-200" : "bg-bg-secondary border-border-light"}`}>
      <p className="text-[10px] text-text-tertiary">{label}</p>
      <p className={`text-base font-bold ${tone === "error" ? "text-red-600" : "text-text-primary"}`}>{value}</p>
    </div>
  );
}
