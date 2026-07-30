"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import HomeFoodCard from "@/components/customer/HomeFoodCard";
import useRestaurantStore from "@/stores/restaurantStore";
import useLocationStore from "@/stores/locationStore";

function QuickOrderMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("restaurant");
  const { currentLocation } = useLocationStore();

  const {
    selectedRestaurant: restaurant,
    menu: menuData,
    categories,
    categoryImages,
    isLoading,
    fetchRestaurantBySlug,
    fetchMenu,
    clearSelectedRestaurant,
  } = useRestaurantStore();

  const [activeCategory, setActiveCategory] = useState("all");

  // No location or no restaurant picked yet — send them back to pick one first
  useEffect(() => {
    if (!currentLocation || !slug) {
      router.replace("/quick-order/location");
    }
  }, [currentLocation, slug, router]);

  // Fetch this restaurant's own menu
  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      const rest = await fetchRestaurantBySlug(slug);
      if (rest?._id) await fetchMenu(rest._id);
    };
    load();
    return () => clearSelectedRestaurant();
  }, [slug]);

  if (!currentLocation || !slug) return null;

  const categoryMap = new Map();
  menuData.forEach((group) => categoryMap.set(group.category, group.items));

  const visibleCategories = activeCategory === "all" ? categories : [activeCategory];
  const visibleItems = visibleCategories.flatMap((cat) => categoryMap.get(cat) || []);
  // HomeFoodCard expects item.restaurant populated — the menu endpoint returns items without it
  const itemsWithRestaurant = restaurant ? visibleItems.map((item) => ({ ...item, restaurant })) : [];

  return (
    <div className="py-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/quick-order/location" className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors shrink-0">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base font-extrabold text-text-primary truncate">{restaurant?.name || "Menu"}</h1>
          <p className="text-xs text-text-tertiary flex items-center gap-1 truncate">
            <MapPin size={11} className="shrink-0" />
            {currentLocation.area}{currentLocation.pincode ? ` · ${currentLocation.pincode}` : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-5">
        {/* ── Left: this restaurant's category sidebar ── */}
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

            {categories.map((cat) => {
              const image = categoryImages?.[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
                  className="flex flex-col items-center gap-1 shrink-0 group w-full"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center text-xl shrink-0 border-2 transition-all ${
                    activeCategory === cat ? "border-primary bg-primary-50 scale-105" : "border-border-light bg-bg-secondary group-hover:border-border-default"
                  }`}>
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={cat} className="w-full h-full object-cover" />
                    ) : (
                      "🍴"
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${activeCategory === cat ? "text-primary" : "text-text-secondary"}`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: items grid ── */}
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
          ) : itemsWithRestaurant.length === 0 ? (
            <div className="text-center py-16 border border-border-light rounded-[var(--radius-xl)] bg-bg-secondary">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-text-primary font-semibold text-sm">
                {activeCategory !== "all" ? `No ${activeCategory} items found` : "No menu items found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {itemsWithRestaurant.map((item) => (
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

export default function QuickOrderMenuPage() {
  return (
    <Suspense>
      <QuickOrderMenuContent />
    </Suspense>
  );
}
