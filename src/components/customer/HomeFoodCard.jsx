"use client";

import { useState } from "react";
import { Plus, Minus, Tag } from "lucide-react";
import { VegBadge, Modal } from "@/components/ui";
import AddonSelector from "./AddonSelector";
import useCartStore from "@/stores/cartStore";

function couponLabel(coupon) {
  if (!coupon) return null;
  if (coupon.type === "percentage") return `${coupon.value}% OFF`;
  if (coupon.type === "flat") return `₹${coupon.value} OFF`;
  if (coupon.type === "free_delivery") return "FREE DELIVERY";
  return null;
}

export default function HomeFoodCard({ item }) {
  const [addonOpen, setAddonOpen] = useState(false);
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const restaurant = item.restaurant;
  const displayPrice = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const hasCustomisation = item.addonGroups?.length > 0 || item.variants?.length > 0;
  const coupon = item.coupon;
  const couponText = couponLabel(coupon);

  // Find matching cart items for this menu item
  const cartItems = items.filter((i) => i.menuItem === item._id);
  const totalInCart = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);

  // Determine if restaurant is currently open
  const isOpen = restaurant?.timing?.isOpen !== false && restaurant?.status === "active";

  const handleAdd = () => {
    if (!isOpen) return;
    if (hasCustomisation) {
      setAddonOpen(true);
      return;
    }
    addItem(
      {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        address: restaurant.address,
        deliveryFee: restaurant.deliverySettings?.deliveryFee || 0,
        freeDeliveryAbove: restaurant.deliverySettings?.freeDeliveryAbove,
        minOrderAmount: restaurant.deliverySettings?.minOrderAmount || 0,
      },
      {
        menuItem: item._id,
        name: item.name,
        price: displayPrice,
        image: item.image,
        isVeg: item.isVeg,
        variant: null,
        addons: [],
        quantity: 1,
      }
    );
  };

  const handleDecrement = () => {
    if (cartItems.length === 0) return;
    const last = cartItems[cartItems.length - 1];
    if (last.quantity > 1) {
      updateQuantity(last.cartId, last.quantity - 1);
    } else {
      removeItem(last.cartId);
    }
  };

  return (
    <>
      <div className={`bg-bg-primary rounded-[var(--radius-xl)] border border-border-light overflow-hidden shadow-sm flex flex-col ${!isOpen ? "grayscale opacity-70" : ""}`}>
        {/* Image */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden flex items-center justify-center">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl select-none">🍽️</span>
          )}
          {!isOpen && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">Closed</span>
            </div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-error px-1.5 py-0.5 rounded-full">
              {Math.round(((item.price - item.discountedPrice) / item.price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-1.5">
            <VegBadge isVeg={item.isVeg} />
          </div>
          <p className="text-sm font-bold text-text-primary leading-snug line-clamp-1">{item.name}</p>
          <p className="text-xs text-text-tertiary truncate">{restaurant?.name}</p>

          {/* Coupon tag */}
          {couponText && (
            <div className="flex items-center gap-1 bg-primary-50 border border-primary/20 rounded-[var(--radius-md)] px-1.5 py-0.5 w-fit">
              <Tag size={9} className="text-primary shrink-0" />
              <span className="text-[10px] font-bold text-primary">{coupon.code}</span>
              <span className="text-[10px] text-primary/70">· {couponText}</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-text-primary">₹{displayPrice}</span>
              {hasDiscount && (
                <span className="text-xs text-text-tertiary line-through">₹{item.price}</span>
              )}
            </div>

            {isOpen ? (
              totalInCart === 0 ? (
                <button
                  onClick={handleAdd}
                  className="h-8 w-16 border-2 border-primary text-primary text-xs font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-0.5 hover:bg-primary-50 transition-colors"
                >
                  <Plus size={12} /> ADD
                </button>
              ) : (
                <div className="h-8 w-16 border-2 border-primary rounded-[var(--radius-md)] flex items-center justify-between px-1">
                  <button
                    onClick={handleDecrement}
                    className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary-50 rounded transition-colors"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-bold text-primary tabular-nums">{totalInCart}</span>
                  <button
                    onClick={handleAdd}
                    className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary-50 rounded transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              )
            ) : (
              <span className="text-[10px] font-semibold text-text-tertiary">Unavailable</span>
            )}
          </div>
        </div>
      </div>

      {/* Addon Selector Modal */}
      {addonOpen && (
        <Modal isOpen={addonOpen} onClose={() => setAddonOpen(false)} size="sm" showClose={false} className="!p-0">
          <AddonSelector item={item} restaurant={restaurant} onClose={() => setAddonOpen(false)} />
        </Modal>
      )}
    </>
  );
}
