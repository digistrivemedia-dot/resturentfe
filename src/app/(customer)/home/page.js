"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import BannerCarousel from "@/components/customer/BannerCarousel";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { CardSkeleton } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";
import { CUISINES, SORT_OPTIONS, FILTER_OPTIONS } from "@/constants";

const QUICK_FILTERS = [
  { id: "offers", label: "Offers" },
  { id: "veg", label: "Pure Veg" },
  { id: "rating4", label: "Ratings 4.0+" },
  { id: "fast", label: "Fast Delivery" },
  { id: "free_delivery", label: "Free Delivery" },
  { id: "new", label: "New" },
];

export default function HomePage() {
  const { restaurants, isLoading, fetchRestaurants } = useRestaurantStore();
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Build API params from filters and sort
  const buildParams = (filters, sort) => {
    const params = {};
    if (filters.includes("veg")) params.isVeg = "true";
    if (filters.includes("offers")) params.offers = "true";
    if (filters.includes("rating4")) params.rating = "4";
    if (filters.includes("fast")) params.deliveryTime = "30";
    if (filters.includes("free_delivery")) params.freeDelivery = "true";
    if (sort !== "relevance") params.sort = sort;
    return params;
  };

  useEffect(() => {
    fetchRestaurants(buildParams(activeFilters, sortBy));
  }, [activeFilters, sortBy]);

  const toggleFilter = (id) =>
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  const featured = restaurants.filter((r) => r.isFeatured);

  return (
    <div className="py-4 md:py-6 space-y-8">

      {/* ── BANNER ── */}
      <BannerCarousel />

      {/* ── CUISINE CATEGORIES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">What&apos;s on your mind?</h2>
          <Link href="/search" className="flex items-center gap-0.5 text-sm font-medium text-primary hover:underline">
            See all <ChevronRight size={15} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {CUISINES.slice(0, 12).map((cuisine) => (
            <Link
              key={cuisine.value}
              href={`/category/${cuisine.value}`}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl group-hover:bg-primary-100 group-hover:scale-105 transition-all shadow-[var(--shadow-sm)]">
                {cuisine.icon}
              </div>
              <span className="text-xs font-medium text-text-secondary text-center w-16 leading-tight group-hover:text-primary transition-colors">
                {cuisine.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TOP OFFERS ── */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 -mx-4 px-4 py-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Top offers for you 🔥</h2>
            <p className="text-xs text-text-secondary">Best deals right now</p>
          </div>
          <Link href="/home?filter=offers" className="text-sm font-semibold text-primary">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {restaurants.filter((r) => r.offers?.length).map((r) => (
            <div key={r._id} className="shrink-0 w-64">
              <RestaurantCard restaurant={r} variant="horizontal" />
            </div>
          ))}
        </div>
      </section>

      {/* ── ALL RESTAURANTS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">
            Restaurants near you
            <span className="ml-2 text-sm font-normal text-text-tertiary">({restaurants.length})</span>
          </h2>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
          {/* Sort / Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-[var(--radius-full)] border transition-colors shrink-0 ${
              showFilters || activeFilters.length
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-primary border-border-default hover:border-primary"
            }`}
          >
            <SlidersHorizontal size={13} />
            {activeFilters.length ? `Filters (${activeFilters.length})` : "Filter"}
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 text-xs font-semibold bg-white border border-border-default rounded-[var(--radius-full)] focus:outline-none focus:border-primary cursor-pointer shrink-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Quick filters */}
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFilter(f.id)}
              className={`flex items-center gap-1 h-9 px-3 text-xs font-semibold rounded-[var(--radius-full)] border transition-all shrink-0 ${
                activeFilters.includes(f.id)
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white text-text-primary border-border-default hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
              {activeFilters.includes(f.id) && <X size={11} className="ml-0.5" />}
            </button>
          ))}
        </div>

        {/* Active filters summary */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-tertiary">{restaurants.length} results</span>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {isLoading && restaurants.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No restaurants found</h3>
            <p className="text-sm text-text-secondary mb-4">Try removing some filters</p>
            <button onClick={() => setActiveFilters([])} className="text-sm font-semibold text-primary hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED / TOP RATED ── */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">⭐ Top Rated</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(0, 3).map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-4" />
    </div>
  );
}
