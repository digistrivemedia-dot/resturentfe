"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, SlidersHorizontal, X, Search } from "lucide-react";
import BannerCarousel from "@/components/customer/BannerCarousel";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { CardSkeleton } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";
import { SORT_OPTIONS } from "@/constants";

// Cuisine categories with real images from /public
const CUISINE_CATEGORIES = [
  { value: "south_indian",  label: "South Indian",  image: "/south-indian.jpeg" },
  { value: "north_indian",  label: "North Indian",  image: "/north-indian.jpg" },
  { value: "chinese",       label: "Chinese",       image: "/chinese.jpg" },
  { value: "italian",       label: "Italian",       image: "/Italian.jpg" },
  { value: "biryani",       label: "Biryani",       image: "/biryani.jpg" },
  { value: "burgers",       label: "Burgers",       image: "/Burger.jpg" },
  { value: "desserts",      label: "Desserts",      image: "/dessert.jpeg" },
];

const QUICK_FILTERS = [
  { id: "offers",        label: "Offers" },
  { id: "veg",           label: "Pure Veg" },
  { id: "rating4",       label: "Ratings 4.0+" },
  { id: "fast",          label: "Fast Delivery" },
  { id: "free_delivery", label: "Free Delivery" },
  { id: "new",           label: "New" },
];

export default function HomePage() {
  const { restaurants, isLoading, fetchRestaurants } = useRestaurantStore();
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const buildParams = (filters, sort) => {
    const params = {};
    if (filters.includes("veg"))          params.isVeg = "true";
    if (filters.includes("offers"))       params.offers = "true";
    if (filters.includes("rating4"))      params.rating = "4";
    if (filters.includes("fast"))         params.deliveryTime = "30";
    if (filters.includes("free_delivery")) params.freeDelivery = "true";
    if (sort !== "relevance")             params.sort = sort;
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
  const withOffers = restaurants.filter((r) => r.offers?.length);

  return (
    <div className="py-4 md:py-6 space-y-8" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── BANNER ── */}
      <BannerCarousel />

      {/* ── CUISINE CATEGORIES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">What&apos;s on your mind?</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Browse by cuisine</p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
          >
            See all <ChevronRight size={13} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
          {CUISINE_CATEGORIES.map((cuisine) => (
            <Link
              key={cuisine.value}
              href={`/category/${cuisine.value}`}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                <Image
                  src={cuisine.image}
                  alt={cuisine.label}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-semibold text-text-secondary text-center w-16 leading-tight group-hover:text-primary transition-colors">
                {cuisine.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TOP OFFERS ── */}
      {withOffers.length > 0 && (
        <section className="bg-bg-secondary -mx-4 px-4 py-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">Top offers for you</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Best deals right now</p>
            </div>
            <Link href="/home?filter=offers" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {withOffers.map((r) => (
              <div key={r._id} className="shrink-0 w-64">
                <RestaurantCard restaurant={r} variant="horizontal" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ALL RESTAURANTS ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Restaurants near you
            </h2>
            {restaurants.length > 0 && (
              <p className="text-xs text-text-tertiary mt-0.5">{restaurants.length} restaurants available</p>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-full border transition-colors shrink-0 ${
              showFilters || activeFilters.length
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-primary border-border-default hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal size={13} />
            {activeFilters.length ? `Filters (${activeFilters.length})` : "Filter"}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 text-xs font-semibold bg-white border border-border-default rounded-full focus:outline-none focus:border-primary cursor-pointer shrink-0 text-text-primary"
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-tertiary">{restaurants.length} results</span>
            <span className="text-text-tertiary">·</span>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Restaurant grid */}
        {isLoading && restaurants.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16 border border-border-light rounded-2xl bg-bg-secondary">
            <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-4">
              <Search size={20} className="text-text-tertiary" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">No restaurants found</h3>
            <p className="text-xs text-text-secondary mb-4">Try removing some filters</p>
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs font-semibold text-primary hover:underline"
            >
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

      {/* ── TOP RATED ── */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">Top Rated</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Highest rated restaurants near you</p>
            </div>
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
