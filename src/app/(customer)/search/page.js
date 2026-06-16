"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, ArrowLeft, Clock, Flame, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import RestaurantCard from "@/components/customer/RestaurantCard";
import { VegBadge } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";
import { CUISINES, SORT_OPTIONS } from "@/constants";
import useDebounce from "@/hooks/useDebounce";
import useLocalStorage from "@/hooks/useLocalStorage";

const TRENDING = ["Biryani", "Pizza", "Burger", "Chinese", "Rolls", "Desserts", "Dosa", "Pasta"];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState("restaurants");
  const [sortBy, setSortBy] = useState("relevance");
  const [showSort, setShowSort] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage("recent-searches", []);
  const debouncedQuery = useDebounce(query, 300);
  const { searchResults, isLoading, searchRestaurants } = useRestaurantStore();

  const saveSearch = (q) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const filtered = (prev || []).filter((s) => s !== q);
      return [q, ...filtered].slice(0, 8);
    });
  };

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      searchRestaurants(debouncedQuery, { sort: sortBy !== "relevance" ? sortBy : undefined });
      saveSearch(debouncedQuery);
    }
  }, [debouncedQuery, sortBy]);

  const filteredRestaurants = searchResults.restaurants;
  const filteredDishes = searchResults.dishes;

  const isEmpty = debouncedQuery && !isLoading && filteredRestaurants.length === 0 && filteredDishes.length === 0;

  return (
    <div className="py-4 min-h-screen">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/home" className="shrink-0 p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveSearch(query)}
            placeholder="Search restaurants or dishes…"
            className="w-full h-11 pl-10 pr-10 text-sm bg-bg-secondary border border-transparent rounded-[var(--radius-full)] focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-text-tertiary transition-colors"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
              <X size={16} />
            </button>
          )}
        </div>
        {debouncedQuery && (
          <button
            onClick={() => setShowSort(!showSort)}
            className={`shrink-0 p-2 rounded-[var(--radius-md)] border transition-colors ${showSort ? "bg-primary text-white border-primary" : "text-text-secondary border-border-light hover:bg-bg-hover"}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        )}
      </div>

      {/* Sort bar */}
      {showSort && debouncedQuery && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4 pb-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSortBy(o.value)}
              className={`shrink-0 h-8 px-3 text-xs font-semibold rounded-full border transition-colors ${
                sortBy === o.value
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-white text-text-secondary border-border-default hover:border-primary hover:text-primary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {/* ── No query: show suggestions ── */}
      {!debouncedQuery && (
        <div className="space-y-6">
          {/* Recent searches */}
          {recentSearches?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Clock size={15} className="text-text-tertiary" /> Recent Searches
                </h3>
                <button onClick={() => setRecentSearches([])} className="text-xs text-primary font-medium hover:underline">
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="flex items-center gap-1.5 h-8 px-3 text-sm bg-bg-secondary rounded-full hover:bg-bg-tertiary transition-colors"
                  >
                    <Clock size={12} className="text-text-tertiary" /> {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending */}
          <div>
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5 mb-3">
              <Flame size={15} className="text-primary" /> Trending Now
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  onClick={() => { setQuery(t); saveSearch(t); }}
                  className="h-9 px-4 text-sm font-medium bg-white border border-border-light rounded-full hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Browse by cuisine */}
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-3">Browse by Cuisine</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {CUISINES.slice(0, 8).map((c) => (
                <Link
                  key={c.value}
                  href={`/category/${c.value}`}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl group-hover:scale-105 group-hover:bg-primary-100 transition-all">
                    {c.icon}
                  </div>
                  <span className="text-xs text-text-secondary text-center group-hover:text-primary transition-colors">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Has query: show results ── */}
      {debouncedQuery && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-border-light gap-6">
            {[
              { id: "restaurants", label: "Restaurants", count: filteredRestaurants.length },
              { id: "dishes", label: "Dishes", count: filteredDishes.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-semibold relative transition-colors ${
                  activeTab === tab.id
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-primary-100 text-primary" : "bg-bg-secondary text-text-tertiary"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {isEmpty && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-text-primary">No results for &quot;{debouncedQuery}&quot;</h3>
              <p className="text-sm text-text-secondary mt-1">Try different keywords or check the spelling</p>
            </div>
          )}

          {/* Restaurant results */}
          {activeTab === "restaurants" && (
            <div>
              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRestaurants.map((r) => (
                    <RestaurantCard key={r._id} restaurant={r} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-8">No restaurants match &quot;{debouncedQuery}&quot;</p>
              )}
            </div>
          )}

          {/* Dish results */}
          {activeTab === "dishes" && (
            <div>
              {filteredDishes.length > 0 ? (
                <div className="space-y-3">
                  {filteredDishes.map((item) => {
                    const restaurant = item.restaurant;
                    return (
                      <Link
                        key={item._id}
                        href={`/restaurant/${restaurant?.slug || "#"}`}
                        className="flex items-center gap-4 bg-white rounded-[var(--radius-xl)] border border-border-light p-3 hover:shadow-[var(--shadow-md)] transition-all group"
                      >
                        <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-3xl shrink-0">
                          🍽️
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <VegBadge isVeg={item.isVeg} />
                            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-xs text-text-tertiary mb-1 line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary">₹{item.discountedPrice || item.price}</span>
                            {item.discountedPrice && item.discountedPrice < item.price && (
                              <span className="text-xs text-text-tertiary line-through">₹{item.price}</span>
                            )}
                          </div>
                          {restaurant && (
                            <p className="text-xs text-text-tertiary mt-0.5">{restaurant.name}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-8">No dishes match &quot;{debouncedQuery}&quot;</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
