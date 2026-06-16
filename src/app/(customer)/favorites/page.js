"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, Clock, ShoppingBag, ChevronRight } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import useRestaurantStore from "@/stores/restaurantStore";
import { CardSkeleton } from "@/components/ui";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toggleFavorite } = useRestaurantStore();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch favorite restaurants from user's favorites array
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        if (user?.favorites?.length > 0) {
          // user.favorites contains populated restaurant objects or IDs
          // If they're populated objects, use them directly
          // If they're IDs, we need to fetch the restaurants
          const favs = user.favorites;
          if (typeof favs[0] === "object" && favs[0]._id) {
            setFavorites(favs);
          } else {
            // Favorites are IDs — fetch restaurants with those IDs
            const { fetchRestaurants } = useRestaurantStore.getState();
            const res = await fetchRestaurants({ ids: favs.join(",") });
            setFavorites(res?.restaurants || []);
          }
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
      setIsLoading(false);
    };
    loadFavorites();
  }, [user?.favorites]);

  const toggleFav = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite(id);
      setFavorites((prev) => prev.filter((r) => r._id !== id));
      // Refresh user data to sync favorites
      const { fetchMe } = useAuthStore.getState();
      fetchMe();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="py-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Favourites</h1>
          {favorites.length > 0 && (
            <p className="text-xs text-text-tertiary">{favorites.length} saved restaurant{favorites.length > 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : favorites.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center mb-5">
            <Heart size={40} className="text-text-tertiary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No favourites yet</h3>
          <p className="text-sm text-text-secondary max-w-xs mb-6">
            Tap the heart on any restaurant to save it here for quick access.
          </p>
          <Link
            href="/home"
            className="h-11 px-8 bg-primary text-white font-semibold text-sm rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors"
          >
            <ShoppingBag size={16} /> Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((restaurant) => {
            const deliveryFee = restaurant.deliverySettings?.deliveryFee;
            const freeAbove = restaurant.deliverySettings?.freeDeliveryAbove;
            const eta = restaurant.deliverySettings?.avgDeliveryTime;

            return (
              <Link
                key={restaurant._id}
                href={`/restaurant/${restaurant.slug}`}
                className="block bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden hover:shadow-[var(--shadow-md)] transition-all group"
              >
                {/* Cover image placeholder */}
                <div className="relative h-44 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                    🍽️
                  </div>

                  {/* Offer badge */}
                  {restaurant.offers?.[0] && (
                    <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-[var(--radius-md)]">
                      {restaurant.offers[0].description}
                    </div>
                  )}

                  {/* Heart button */}
                  <button
                    onClick={(e) => toggleFav(restaurant._id, e)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={16}
                      className="text-error fill-error"
                    />
                  </button>

                  {/* Closed overlay */}
                  {!restaurant.timing?.isOpen && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-black/70 text-white text-sm font-bold px-4 py-1.5 rounded-[var(--radius-full)]">
                        Currently Closed
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {restaurant.cuisines?.join(", ")}
                      </p>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-success text-white text-xs font-bold px-2 py-1 rounded-[var(--radius-md)] shrink-0">
                      <Star size={10} className="fill-white" />
                      {restaurant.rating?.average}
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {eta} mins
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border-default" />
                    <span>
                      {deliveryFee === 0
                        ? <span className="text-success font-semibold">Free delivery</span>
                        : freeAbove
                          ? `Free above ₹${freeAbove}`
                          : `₹${deliveryFee} delivery`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border-default" />
                    <span>₹{restaurant.costForTwo} for 2</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Explore more */}
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-border-default rounded-[var(--radius-xl)] text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            <ShoppingBag size={15} /> Explore more restaurants
          </Link>
        </div>
      )}
    </div>
  );
}
