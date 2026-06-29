"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, SlidersHorizontal, X, ChevronDown, Search, UtensilsCrossed } from "lucide-react";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { CardSkeleton } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";
import { CUISINES, SORT_OPTIONS } from "@/constants";

const QUICK_FILTERS = [
  { id: "veg",           label: "Pure Veg" },
  { id: "rating4",       label: "Ratings 4.0+" },
  { id: "fast",          label: "Under 30 mins" },
  { id: "free_delivery", label: "Free Delivery" },
  { id: "offers",        label: "Offers" },
];

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const { restaurants, isLoading, fetchRestaurants } = useRestaurantStore();
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");

  const cuisine = CUISINES.find((c) => c.value === slug);
  const label = cuisine?.label || slug.replace(/_/g, " ");
  const image = cuisine?.image || null;

  const toggleFilter = (id) =>
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  useEffect(() => {
    const p = { cuisines: label };
    if (activeFilters.includes("veg"))          p.isVeg = "true";
    if (activeFilters.includes("offers"))       p.offers = "true";
    if (activeFilters.includes("rating4"))      p.rating = "4";
    if (activeFilters.includes("fast"))         p.deliveryTime = "30";
    if (activeFilters.includes("free_delivery")) p.freeDelivery = "true";
    if (sortBy !== "relevance")                 p.sort = sortBy;
    fetchRestaurants(p);
  }, [slug, activeFilters, sortBy]);

  const sorted = restaurants;

  return (
    <div className="py-4 min-h-screen" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/home"
          className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex items-center gap-3">
          {/* Cuisine image or fallback */}
          <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-border-light shadow-sm">
            {image ? (
              <Image
                src={image}
                alt={label}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-primary" strokeWidth={1.8} />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-lg font-bold text-text-primary capitalize">{label}</h1>
            <p className="text-xs text-text-tertiary">
              {isLoading ? "Loading…" : `${sorted.length} restaurant${sorted.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3 mb-4">
        {/* Sort */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 pl-3 pr-8 text-xs font-semibold bg-white border border-border-default rounded-full focus:outline-none focus:border-primary cursor-pointer appearance-none text-text-primary"
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
            className={`flex items-center gap-1 h-9 px-3.5 text-xs font-semibold rounded-full border transition-all shrink-0 ${
              activeFilters.includes(f.id)
                ? "bg-text-primary text-white border-text-primary"
                : "bg-white text-text-secondary border-border-default hover:border-primary hover:text-primary"
            }`}
          >
            {f.label}
            {activeFilters.includes(f.id) && <X size={11} className="ml-0.5" />}
          </button>
        ))}
      </div>

      {/* Active filters summary */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs text-text-tertiary">{sorted.length} results</p>
          <span className="text-text-tertiary text-xs">·</span>
          <button
            onClick={() => setActiveFilters([])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {isLoading && sorted.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 border border-border-light rounded-2xl bg-bg-secondary">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
            <Search size={20} className="text-text-tertiary" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No {label} restaurants found
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Try adjusting your filters or explore other cuisines
          </p>
          <button
            onClick={() => setActiveFilters([])}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}

      {/* ── Browse other cuisines ── */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text-primary">Explore other cuisines</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {CUISINES.filter((c) => c.value !== slug).slice(0, 10).map((c) => (
            <Link
              key={c.value}
              href={`/category/${c.value}`}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.label}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-50 flex items-center justify-center">
                    <UtensilsCrossed size={16} className="text-primary" strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-text-secondary text-center w-14 leading-tight group-hover:text-primary transition-colors">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
}
