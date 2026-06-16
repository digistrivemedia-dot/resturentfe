"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, Search, Clock } from "lucide-react";
import useMenuManagementStore from "@/stores/menuManagementStore";
import { Toggle, Modal, Badge, VegBadge } from "@/components/ui";

const FOOD_EMOJIS = {
  Starters: "🍢",
  "Main Course": "🍛",
  Biryani: "🍚",
  Breads: "🫓",
  Beverages: "🥤",
  Desserts: "🍮",
};

const TAG_CONFIG = {
  bestseller: { label: "Bestseller", className: "bg-warning-light text-warning-dark" },
  new: { label: "New", className: "bg-success-light text-success-dark" },
  chef_special: { label: "Chef Special", className: "bg-primary-50 text-primary" },
};

const SPICE_LABELS = {
  none: "No Spice",
  mild: "Mild",
  medium: "Medium",
  hot: "Hot",
  extra_hot: "Extra Hot",
};

export default function MenuManagementPage() {
  const { menu, isLoading, fetchMenu, toggleAvailability, bulkToggle, deleteMenuItem, getAllItems } =
    useMenuManagementStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  useEffect(() => {
    fetchMenu().catch(() => {});
  }, []);

  const items = getAllItems();

  const categoryNames = useMemo(() => menu.map((g) => g.category), [menu]);
  const allCategories = ["All", ...categoryNames];

  const itemCountByCategory = useMemo(() => {
    const counts = { All: items.length };
    categoryNames.forEach((cat) => {
      counts[cat] = items.filter((i) => i.category === cat).length;
    });
    return counts;
  }, [items, categoryNames]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, activeCategory]);

  async function handleToggleAvailability(id) {
    try {
      await toggleAvailability(id);
    } catch {
      // error handled in store
    }
  }

  async function handleBulkToggle(enabled) {
    const ids =
      activeCategory === "All"
        ? items.map((i) => i._id)
        : items.filter((i) => i.category === activeCategory).map((i) => i._id);
    try {
      await bulkToggle(ids, enabled);
    } catch {
      // error handled in store
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteModal.item) return;
    try {
      await deleteMenuItem(deleteModal.item._id);
    } catch {
      // error handled in store
    }
    setDeleteModal({ open: false, item: null });
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Page Header */}
      <div className="bg-bg-primary border-b border-border-light px-4 py-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                Menu Management
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Manage your restaurant menu items
              </p>
            </div>
            <Link
              href="/restaurant/menu/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
              Add New Item
            </Link>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-primary text-white shadow-[var(--shadow-sm)]"
                  : "bg-bg-primary text-text-secondary border border-border-light hover:bg-bg-hover"
              }`}
            >
              {cat}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-[var(--radius-full)] ${
                  activeCategory === cat
                    ? "bg-white/20 text-white"
                    : "bg-bg-secondary text-text-tertiary"
                }`}
              >
                {itemCountByCategory[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-4 mb-3 flex-wrap gap-3">
          <p className="text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">
              {filteredItems.length}
            </span>{" "}
            {filteredItems.length === 1 ? "item" : "items"}
            {search && (
              <span className="ml-1">
                matching &quot;{search}&quot;
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggle(true)}
              className="px-3 py-1.5 text-xs font-medium text-success bg-success-light rounded-[var(--radius-md)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              Enable All
            </button>
            <button
              onClick={() => handleBulkToggle(false)}
              className="px-3 py-1.5 text-xs font-medium text-error bg-error-light rounded-[var(--radius-md)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && items.length === 0 && (
          <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-12 text-center">
            <p className="text-text-secondary text-sm">Loading menu...</p>
          </div>
        )}

        {/* Items List */}
        {!isLoading && filteredItems.length === 0 ? (
          <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-12 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-text-primary font-medium">No items found</p>
            <p className="text-text-tertiary text-sm mt-1">
              {search
                ? `No items match "${search}". Try a different search.`
                : "No items in this category yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-primary hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] px-4 py-4 flex items-center gap-4 transition-opacity ${
                  !item.isAvailable ? "opacity-60" : ""
                }`}
              >
                {/* Veg/Non-Veg Indicator */}
                <div className="shrink-0">
                  <VegBadge isVeg={item.isVeg} />
                </div>

                {/* Image Placeholder */}
                <div
                  className={`shrink-0 w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-2xl ${
                    item.isVeg ? "bg-success-light" : "bg-error-light"
                  }`}
                >
                  {FOOD_EMOJIS[item.category] || "🍽️"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-primary text-sm">
                      {item.name}
                    </span>
                    {(item.tags || []).map((tag) => {
                      const cfg = TAG_CONFIG[tag];
                      if (!cfg) return null;
                      return (
                        <span
                          key={tag}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-full)] ${cfg.className}`}
                        >
                          {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {item.category}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {/* Price */}
                    <div className="flex items-center gap-1.5">
                      {item.discountedPrice ? (
                        <>
                          <span className="text-sm font-semibold text-text-primary">
                            ₹{item.discountedPrice}
                          </span>
                          <span className="text-xs text-text-tertiary line-through">
                            ₹{item.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-text-primary">
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                    {/* Prep Time */}
                    <span className="inline-flex items-center gap-1 text-xs text-text-tertiary bg-bg-secondary px-2 py-0.5 rounded-[var(--radius-full)]">
                      <Clock size={11} />
                      {item.preparationTime} mins
                    </span>
                    {/* Spice */}
                    {item.spiceLevel && item.spiceLevel !== "none" && (
                      <span className="text-xs text-text-tertiary">
                        🌶️ {SPICE_LABELS[item.spiceLevel] || item.spiceLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-3">
                  <Toggle
                    checked={item.isAvailable}
                    onChange={() => handleToggleAvailability(item._id)}
                    size="sm"
                  />
                  <Link
                    href={`/restaurant/menu/${item._id}/edit`}
                    className="p-2 text-text-tertiary hover:text-primary hover:bg-primary-50 rounded-[var(--radius-md)] transition-colors"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ open: true, item })}
                    className="p-2 text-text-tertiary hover:text-error hover:bg-error-light rounded-[var(--radius-md)] transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="Delete Item"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ open: false, item: null })}
              className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-error rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Delete
            </button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="text-4xl mb-3">🗑️</div>
          <p className="text-text-primary font-medium">
            Delete &quot;{deleteModal.item?.name}&quot;?
          </p>
          <p className="text-text-secondary text-sm mt-1">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
