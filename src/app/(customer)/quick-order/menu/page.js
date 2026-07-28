"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import HomeFoodCard from "@/components/customer/HomeFoodCard";
import api from "@/lib/api";
import useLocationStore from "@/stores/locationStore";

export default function QuickOrderMenuPage() {
  const router = useRouter();
  const { currentLocation } = useLocationStore();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // No location selected yet — send them back to pick one first
  useEffect(() => {
    if (!currentLocation) {
      router.replace("/quick-order/location");
    }
  }, [currentLocation, router]);

  const fetchFeed = useCallback(async (category) => {
    if (!currentLocation) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentLocation.lat) params.set("lat", currentLocation.lat);
      if (currentLocation.lng) params.set("lng", currentLocation.lng);
      if (category && category !== "all") params.set("category", category);

      const res = await api.get(`/home/feed?${params.toString()}`);
      setCategories(res.data.categories || []);
      setItems(res.data.items || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchFeed(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, currentLocation]);

  if (!currentLocation) return null;

  return (
    <div className="py-4">
      {/* Delivery location bar */}
      <div className="flex items-center justify-between gap-3 mb-4 bg-bg-secondary rounded-[var(--radius-xl)] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={15} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-text-primary truncate">
            {currentLocation.area || "Selected location"}
            {currentLocation.pincode ? ` · ${currentLocation.pincode}` : ""}
          </span>
        </div>
        <Link href="/quick-order/location" className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-0.5">
          Change <ChevronRight size={12} />
        </Link>
      </div>

      <h1 className="text-lg font-extrabold text-text-primary mb-4">Order Food</h1>

      <div className="flex gap-3 sm:gap-5">
        {/* ── Left: category sidebar ── */}
        <div className="w-16 sm:w-20 shrink-0">
          <div
            className="sticky flex flex-col items-center gap-3 max-h-[75vh] overflow-y-auto scrollbar-hide pb-4"
            style={{ top: "calc(var(--header-height) + 12px)" }}
          >
            <button
              onClick={() => setActiveCategory("all")}
              className="flex flex-col items-center gap-1 shrink-0 group w-full"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl shrink-0 border-2 transition-all ${
                activeCategory === "all" ? "border-primary bg-primary-50 scale-105" : "border-border-light bg-bg-secondary group-hover:border-border-default"
              }`}>
                🍽️
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight ${activeCategory === "all" ? "text-primary" : "text-text-secondary"}`}>
                All
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(activeCategory === cat.name ? "all" : cat.name)}
                className="flex flex-col items-center gap-1 shrink-0 group w-full"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center text-xl shrink-0 border-2 transition-all ${
                  activeCategory === cat.name ? "border-primary scale-105" : "border-border-light group-hover:border-border-default"
                }`}>
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center">🍽️</div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${activeCategory === cat.name ? "text-primary" : "text-text-secondary"}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: items ── */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-bg-secondary" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 border border-border-light rounded-[var(--radius-xl)] bg-bg-secondary">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-text-primary font-semibold text-sm">
                {activeCategory !== "all" ? `No ${activeCategory} items found nearby` : "No food items found nearby"}
              </p>
              <p className="text-text-secondary text-xs mt-1">Try a different category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => (
                <HomeFoodCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-4" />
    </div>
  );
}
