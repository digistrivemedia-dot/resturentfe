"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import BannerCarousel from "@/components/customer/BannerCarousel";
import RestaurantCard from "@/components/customer/RestaurantCard";
import HomeFoodCard from "@/components/customer/HomeFoodCard";
import { CardSkeleton } from "@/components/ui";
import api from "@/lib/api";
import useLocationStore from "@/stores/locationStore";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const { currentLocation, setCurrentLocation } = useLocationStore();

  const [locationStatus, setLocationStatus] = useState("idle"); // idle | requesting | granted | denied
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(false);

  // Track whether we've done the initial location setup
  const didInit = useRef(false);

  // ── Fetch feed ──────────────────────────────────────────────────────────────
  const fetchFeed = useCallback(async (lat, lng, category) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat) params.set("lat", lat);
      if (lng) params.set("lng", lng);
      if (category && category !== "all") params.set("category", category);

      const res = await api.get(`/home/feed?${params.toString()}`);
      setCategories(res.data.categories || []);
      setRestaurants(res.data.restaurants || []);
      setItems(res.data.items || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Request GPS (browser prompt) ────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      fetchFeed(null, null, activeCategory);
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = {
          lat: latitude,
          lng: longitude,
          area: "Current Location",
          city: "Nearby",
          fullAddress: "Using GPS location",
        };
        setCurrentLocation(loc); // save to store so header shows it too
        setLocationStatus("granted");
        fetchFeed(latitude, longitude, activeCategory);
      },
      () => {
        setLocationStatus("denied");
        fetchFeed(null, null, activeCategory);
      },
      { timeout: 8000 }
    );
  }, [activeCategory, fetchFeed, setCurrentLocation]);

  // ── On mount: use stored location or ask for GPS ────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (currentLocation?.lat && currentLocation?.lng) {
      // Already have location from store (set via header picker or previous visit)
      setLocationStatus("granted");
      fetchFeed(currentLocation.lat, currentLocation.lng, activeCategory);
    } else {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── When header location changes, re-fetch ──────────────────────────────────
  const prevLocRef = useRef(null);
  useEffect(() => {
    if (!currentLocation) return;
    const key = `${currentLocation.lat},${currentLocation.lng}`;
    if (prevLocRef.current === key) return; // same coords, skip
    prevLocRef.current = key;

    if (!didInit.current) return; // let the mount effect handle first load
    setLocationStatus("granted");
    fetchFeed(currentLocation.lat, currentLocation.lng, activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  // ── When category changes, re-fetch with current location ───────────────────
  useEffect(() => {
    if (locationStatus === "idle") return;
    fetchFeed(currentLocation?.lat, currentLocation?.lng, activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const isRestaurantOpen = (r) => r.timing?.isOpen !== false;

  return (
    <div className="py-4 md:py-6 space-y-8">

      {/* ── BANNER ── */}
      <BannerCarousel />

      {/* ── LOCATION BANNER ── */}
      {locationStatus === "denied" && (
        <div className="flex items-center gap-3 bg-warning-light border border-warning/20 rounded-[var(--radius-xl)] px-4 py-3 -mx-1">
          <MapPin size={18} className="text-warning shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Enable location for nearby food</p>
            <p className="text-xs text-text-secondary">Tap the location pin in the top-left to set your location</p>
          </div>
          <button
            onClick={requestLocation}
            className="text-xs font-bold text-warning hover:underline shrink-0"
          >
            Allow
          </button>
        </div>
      )}

      {/* ── FOOD CATEGORIES ── */}
      {(categories.length > 0 || isLoading) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary">What&apos;s on your mind?</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Browse by food type</p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {/* All chip */}
            <button
              onClick={() => setActiveCategory("all")}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-md transition-all duration-200 flex items-center justify-center text-2xl bg-bg-secondary ${activeCategory === "all" ? "border-primary scale-105" : "border-white group-hover:shadow-lg group-hover:scale-105"}`}>
                🍽️
              </div>
              <span className={`text-[11px] font-semibold text-center w-16 leading-tight ${activeCategory === "all" ? "text-primary" : "text-text-secondary group-hover:text-primary"} transition-colors`}>
                All
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(activeCategory === cat.name ? "all" : cat.name)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 shadow-md transition-all duration-200 ${activeCategory === cat.name ? "border-primary scale-105" : "border-white group-hover:shadow-lg group-hover:scale-105"}`}>
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold text-center w-16 leading-tight transition-colors ${activeCategory === cat.name ? "text-primary" : "text-text-secondary group-hover:text-primary"}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOD NEAR YOU ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary"> 
              {activeCategory === "all" ? "Food near you " : `${activeCategory} near you`}
            </h2>
            {locationStatus === "granted" && (
              <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> Within 8 km
              </p>
            )}
          </div>
          {items.length > 0 && (
            <span className="text-xs text-text-tertiary">{items.length} items</span>
          )}
        </div>

        {locationStatus === "requesting" || isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => (
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
          <div className="text-center py-12 border border-border-light rounded-[var(--radius-xl)] bg-bg-secondary">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-text-primary font-semibold text-sm">
              {locationStatus === "denied"
                ? "Set your location to see food near you"
                : activeCategory !== "all"
                ? `No ${activeCategory} items found nearby`
                : "No food items found nearby"}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              {locationStatus === "denied"
                ? "Tap the location pin at the top to set your area"
                : "Try a different category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item) => (
              <HomeFoodCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* ── RESTAURANTS NEAR YOU ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary">Restaurants near you</h2>
            {restaurants.length > 0 && (
              <p className="text-xs text-text-tertiary mt-0.5">{restaurants.length} restaurants</p>
            )}
          </div>
        </div>

        {isLoading && restaurants.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 border border-border-light rounded-[var(--radius-xl)] bg-bg-secondary">
            <div className="text-4xl mb-3">🏪</div>
            <p className="text-text-primary font-semibold text-sm">No restaurants found nearby</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((r) => (
              <div key={r._id} className={!isRestaurantOpen(r) ? "grayscale opacity-70" : ""}>
                <RestaurantCard restaurant={r} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom padding for mobile nav */}
      <div className="h-4" />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
