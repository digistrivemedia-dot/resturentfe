"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Star, Clock, ShoppingBag, RefreshCw, Plus, Minus } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import useRestaurantStore from "@/stores/restaurantStore";
import useCartStore from "@/stores/cartStore";
import FavouriteButton from "@/components/customer/FavouriteButton";
import { CardSkeleton } from "@/components/ui";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, fetchMe, optimisticToggleFavoriteRestaurant } = useAuthStore();
  const { toggleFavorite } = useRestaurantStore();
  const addItem = useCartStore((s) => s.addItem);
  const cartRestaurant = useCartStore((s) => s.restaurant);
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [activeTab, setActiveTab] = useState("dishes");
  const [isLoading, setIsLoading] = useState(false);
  const [reorderMsg, setReorderMsg] = useState(null); // { type, text }

  const favouriteRestaurants = user?.favorites?.filter((r) => typeof r === "object" && r._id) || [];
  const favouriteDishes = user?.favoriteDishes?.filter((d) => typeof d === "object" && d._id) || [];

  // Refresh on mount
  useEffect(() => {
    setIsLoading(true);
    fetchMe().finally(() => setIsLoading(false));
  }, []);

  const handleToggleRestaurant = useCallback(async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    optimisticToggleFavoriteRestaurant(id);
    try {
      await toggleFavorite(id);
    } catch {
      optimisticToggleFavoriteRestaurant(id);
    }
  }, [optimisticToggleFavoriteRestaurant, toggleFavorite]);

  const handleReorder = useCallback((dish) => {
    if (!dish.restaurant?._id) return;
    const restaurantPayload = {
      _id: dish.restaurant._id,
      name: dish.restaurant.name,
      slug: dish.restaurant.slug,
      deliveryFee: 0,
      minOrderAmount: 0,
    };
    const result = addItem(restaurantPayload, {
      menuItem: dish._id,
      name: dish.name,
      price: dish.discountedPrice || dish.price,
      image: dish.image,
      isVeg: dish.isVeg,
      variant: null,
      addons: [],
      quantity: 1,
    });
    if (result === "switched") {
      showMsg("warning", `Switched to ${dish.restaurant.name} — cart updated!`);
    } else {
      showMsg("success", `${dish.name} added to cart!`);
    }
  }, [addItem]);

  const showMsg = (type, text) => {
    setReorderMsg({ type, text });
    setTimeout(() => setReorderMsg(null), 2500);
  };

  const TABS = [
    { id: "dishes", label: "Dishes", count: favouriteDishes.length },
    { id: "restaurants", label: "Restaurants", count: favouriteRestaurants.length },
  ];

  return (
    <div className="py-4 max-w-2xl mx-auto">

      {/* Re-order toast */}
      {reorderMsg && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all ${
          reorderMsg.type === "success"
            ? "bg-success text-white"
            : "bg-warning text-white"
        }`}>
          {reorderMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-0">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Favourites</h1>
        </div>
      </div>

      {/* Tab bar — Swiggy/Zomato style */}
      <div className="flex border-b border-border-light gap-6 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 pt-4 text-sm font-semibold relative transition-colors flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-primary-100 text-primary" : "bg-bg-secondary text-text-tertiary"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* ── DISHES TAB ── */}
          {activeTab === "dishes" && (
            <>
              {favouriteDishes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Heart size={36} className="text-text-tertiary" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2">No favourite dishes yet</h3>
                  <p className="text-sm text-text-secondary max-w-xs mb-6">
                    Tap the ❤️ on any food item to save it here.
                  </p>
                  <Link
                    href="/home"
                    className="h-11 px-8 bg-primary text-white font-semibold text-sm rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors"
                  >
                    <ShoppingBag size={16} /> Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {favouriteDishes.map((dish) => {
                    const displayPrice = dish.discountedPrice || dish.price;
                    const hasDiscount = dish.discountedPrice && dish.discountedPrice < dish.price;
                    return (
                      <div
                        key={dish._id}
                        className="flex items-center gap-4 bg-white rounded-[var(--radius-xl)] border border-border-light p-3 shadow-sm"
                      >
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-[var(--radius-lg)] bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                          {dish.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="select-none">🍽️</span>
                          )}
                          {/* Veg dot */}
                          <span className={`absolute bottom-1 left-1 w-3 h-3 rounded-sm border-2 flex items-center justify-center ${dish.isVeg ? "border-green-600" : "border-red-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-text-primary truncate">
                            {dish.name}
                          </h3>
                          {dish.restaurant?.name && (
                            <p className="text-xs text-text-tertiary mt-0.5">{dish.restaurant.name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-text-primary">₹{displayPrice}</span>
                            {hasDiscount && (
                              <span className="text-xs text-text-tertiary line-through">₹{dish.price}</span>
                            )}
                          </div>
                          {/* Re-order / Stepper */}
                          {(() => {
                            const dishCartItems = cartItems.filter((i) => i.menuItem === dish._id);
                            const totalQty = dishCartItems.reduce((s, i) => s + (i.quantity || 1), 0);

                            const handleDecrement = () => {
                              if (dishCartItems.length === 0) return;
                              const last = dishCartItems[dishCartItems.length - 1];
                              if (last.quantity > 1) updateQuantity(last.cartId, last.quantity - 1);
                              else removeItem(last.cartId);
                            };

                            return totalQty === 0 ? (
                              <button
                                onClick={() => handleReorder(dish)}
                                className="mt-1.5 flex items-center gap-1 text-xs font-bold text-primary border border-primary rounded-full px-2.5 py-1 hover:bg-primary-50 transition-colors"
                              >
                                <RefreshCw size={10} />
                                Re-order
                              </button>
                            ) : (
                              <div className="mt-1.5 flex items-center gap-0 h-7 w-24 border-2 border-primary rounded-[var(--radius-md)] overflow-hidden">
                                <button
                                  onClick={handleDecrement}
                                  className="flex-1 h-full flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-primary tabular-nums">{totalQty}</span>
                                <button
                                  onClick={() => handleReorder(dish)}
                                  className="flex-1 h-full flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Heart to remove */}
                        <FavouriteButton item={dish} size={20} variant="bare" className="shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── RESTAURANTS TAB ── */}
          {activeTab === "restaurants" && (
            <>
              {favouriteRestaurants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Heart size={36} className="text-text-tertiary" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2">No favourite restaurants yet</h3>
                  <p className="text-sm text-text-secondary max-w-xs mb-6">
                    Tap the heart on any restaurant to save it here.
                  </p>
                  <Link
                    href="/home"
                    className="h-11 px-8 bg-primary text-white font-semibold text-sm rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors"
                  >
                    <ShoppingBag size={16} /> Browse Restaurants
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favouriteRestaurants.map((restaurant) => {
                    const deliveryFee = restaurant.deliverySettings?.deliveryFee;
                    const freeAbove = restaurant.deliverySettings?.freeDeliveryAbove;
                    const eta = restaurant.deliverySettings?.avgDeliveryTime;
                    return (
                      <Link
                        key={restaurant._id}
                        href={`/restaurant/${restaurant.slug}`}
                        className="block bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden hover:shadow-[var(--shadow-md)] transition-all group"
                      >
                        <div className="relative h-44 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🍽️</div>
                          {restaurant.offers?.[0] && (
                            <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-[var(--radius-md)]">
                              {restaurant.offers[0].description}
                            </div>
                          )}
                          {/* Heart button to remove */}
                          <button
                            onClick={(e) => handleToggleRestaurant(restaurant._id, e)}
                            className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          >
                            <Heart size={16} className="text-rose-500 fill-rose-500" />
                          </button>
                          {!restaurant.timing?.isOpen && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-black/70 text-white text-sm font-bold px-4 py-1.5 rounded-[var(--radius-full)]">Currently Closed</span>
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">{restaurant.name}</h3>
                              <p className="text-xs text-text-secondary mt-0.5 truncate">{restaurant.cuisines?.join(", ")}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-success text-white text-xs font-bold px-2 py-1 rounded-[var(--radius-md)] shrink-0">
                              <Star size={10} className="fill-white" />
                              {restaurant.rating?.average}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1"><Clock size={11} /> {eta} mins</span>
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
                  <Link
                    href="/home"
                    className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-border-default rounded-[var(--radius-xl)] text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    <ShoppingBag size={15} /> Explore more restaurants
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
