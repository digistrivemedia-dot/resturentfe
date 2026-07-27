"use client";

/**
 * FavouriteButton — Zomato/Swiggy-style animated heart button for food items.
 *
 * Props:
 *   item            — full dish/food object { _id, name, image, price, ... }
 *   className       — extra classes for the outer button
 *   size            — lucide icon size (default 16)
 *   variant         — 'circle' (white bg, default) | 'bare' (no bg)
 *   requireLogin    — if true shows login prompt for guests (default true)
 */
import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import useRestaurantStore from "@/stores/restaurantStore";

export default function FavouriteButton({
  item,
  className = "",
  size = 16,
  variant = "circle",
  requireLogin = true,
}) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const optimisticToggleFavoriteDish = useAuthStore((s) => s.optimisticToggleFavoriteDish);
  const toggleFavoriteDish = useRestaurantStore((s) => s.toggleFavoriteDish);

  const [popping, setPopping] = useState(false);

  const isFav =
    user?.favoriteDishes?.some((d) => {
      const id = typeof d === "object" ? d._id : d;
      return id?.toString() === item?._id?.toString();
    }) ?? false;

  const handleClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (requireLogin && !isAuthenticated) {
        alert("Please log in to save favourite dishes.");
        return;
      }

      // Animate pop
      setPopping(true);
      setTimeout(() => setPopping(false), 300);

      // Optimistic update
      optimisticToggleFavoriteDish(item);

      try {
        await toggleFavoriteDish(item._id);
      } catch {
        // Revert on error
        optimisticToggleFavoriteDish(item);
      }
    },
    [isAuthenticated, item, optimisticToggleFavoriteDish, requireLogin, toggleFavoriteDish]
  );

  if (!item?._id) return null;

  const circleClass =
    "w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors";
  const bareClass = "flex items-center justify-center p-1";

  return (
    <button
      onClick={handleClick}
      aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
      className={`${variant === "circle" ? circleClass : bareClass} ${popping ? "scale-125" : "scale-100"} transition-transform duration-150 ${className}`}
    >
      <Heart
        size={size}
        className={
          isFav
            ? "text-rose-500 fill-rose-500"
            : "text-gray-400 hover:text-rose-400 transition-colors"
        }
      />
    </button>
  );
}
