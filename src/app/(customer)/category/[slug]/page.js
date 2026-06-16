"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { EmptyState } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";
import { CUISINES, SORT_OPTIONS, FILTER_OPTIONS } from "@/constants";

const QUICK_FILTERS = [
  { id: "veg", label: "Pure Veg" },
  { id: "rating4", label: "Ratings 4.0+" },
  { id: "fast", label: "Under 30 mins" },
  { id: "free_delivery", label: "Free Delivery" },
  { id: "offers", label: "Offers" },
];

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const { restaurants, isLoading, fetchRestaurants } = useRestaurantStore();
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  const cuisine = CUISINES.find((c) => c.value === slug);
  const label = cuisine?.label || slug.replace(/_/g, " ");
  const icon = cuisine?.icon || "🍽️";

  const toggleFilter = (id) =>
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  useEffect(() => {
    const params = { cuisines: label };
    if (activeFilters.includes("veg")) params.isVeg = "true";
    if (activeFilters.includes("offers")) params.offers = "true";
    if (activeFilters.includes("rating4")) params.rating = "4";
    if (activeFilters.includes("fast")) params.deliveryTime = "30";
    if (activeFilters.includes("free_delivery")) params.freeDelivery = "true";
    if (sortBy !== "relevance") params.sort = sortBy;
    fetchRestaurants(params);
  }, [slug, activeFilters, sortBy]);

  const sorted = restaurants;

  return (
    <div className="py-4 min-h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/home" className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h1 className="text-xl font-bold text-text-primary capitalize">{label}</h1>
            <p className="text-xs text-text-tertiary">{sorted.length} restaurants</p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3 mb-4">
        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 pl-3 pr-8 text-xs font-semibold bg-white border border-border-default rounded-full focus:outline-none focus:border-primary cursor-pointer appearance-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
        </div>

        {/* Quick filters */}
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => toggleFilter(f.id)}
            className={`flex items-center gap-1 h-9 px-3 text-xs font-semibold rounded-full border transition-all shrink-0 ${
              activeFilters.includes(f.id)
                ? "bg-text-primary text-white border-text-primary"
                : "bg-white text-text-primary border-border-default hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
            {activeFilters.includes(f.id) && <X size={11} />}
          </button>
        ))}
      </div>

      {/* Active filters badge */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs text-text-tertiary">{sorted.length} results</p>
          <button onClick={() => setActiveFilters([])} className="text-xs font-medium text-primary hover:underline">
            Clear all filters
          </button>
        </div>
      )}

      {/* Results */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">{icon}</span>}
          title={`No ${label} restaurants`}
          description="Try adjusting your filters or explore other cuisines"
          action={() => setActiveFilters([])}
          actionLabel="Clear Filters"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}

      {/* Browse other cuisines */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-text-primary mb-4">Explore other cuisines</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {CUISINES.filter((c) => c.value !== slug).slice(0, 10).map((c) => (
            <Link
              key={c.value}
              href={`/category/${c.value}`}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl group-hover:scale-105 group-hover:bg-primary-100 transition-all shadow-sm">
                {c.icon}
              </div>
              <span className="text-xs text-text-secondary text-center w-14 leading-tight group-hover:text-primary transition-colors">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
}
