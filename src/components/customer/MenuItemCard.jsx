"use client";

import { useState } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { VegBadge, Modal } from "@/components/ui";
import AddonSelector from "./AddonSelector";
import useCartStore from "@/stores/cartStore";

const TAG_STYLES = {
  bestseller: "text-yellow-700 bg-yellow-50 border border-yellow-200",
  new: "text-blue-700 bg-blue-50 border border-blue-200",
  chef_special: "text-purple-700 bg-purple-50 border border-purple-200",
  must_try: "text-green-700 bg-green-50 border border-green-200",
};

const TAG_LABELS = {
  bestseller: "★ Bestseller",
  new: "New",
  chef_special: "Chef's Special",
  must_try: "Must Try",
};

export default function MenuItemCard({ item, restaurant }) {
  const [addonOpen, setAddonOpen] = useState(false);
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  // Find matching cart items for this menu item
  const cartItems = items.filter((i) => i.menuItem === item._id);
  const totalInCart = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const hasCustomisation = item.addonGroups?.length > 0 || item.variants?.length > 0;
  const displayPrice = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  const handleSimpleAdd = () => {
    if (hasCustomisation) {
      setAddonOpen(true);
      return;
    }
    addItem(
      {
        _id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
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
      <div className={`flex gap-3 py-4 border-b border-border-light last:border-0 ${!item.isAvailable ? "opacity-50" : ""}`}>

        {/* Left: Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Veg badge + tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <VegBadge isVeg={item.isVeg} />
            {item.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TAG_STYLES[tag] || "bg-bg-secondary text-text-secondary"}`}>
                {TAG_LABELS[tag] || tag}
              </span>
            ))}
          </div>

          {/* Name */}
          <h3 className="text-sm font-bold text-text-primary leading-snug">{item.name}</h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">₹{displayPrice}</span>
            {hasDiscount && (
              <span className="text-xs text-text-tertiary line-through">₹{item.price}</span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-text-tertiary leading-relaxed line-clamp-2">{item.description}</p>
          )}

          {/* Customisable label */}
          {hasCustomisation && (
            <button
              onClick={() => setAddonOpen(true)}
              className="inline-flex items-center gap-0.5 text-xs text-primary font-medium w-fit hover:underline"
            >
              <ChevronDown size={12} /> Customisable
            </button>
          )}
        </div>

        {/* Right: Image + Add button */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {/* Image */}
          <div className="relative w-24 h-24 rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <span className="text-3xl select-none">🍽️</span>
            {!item.isAvailable && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="text-[10px] font-bold text-text-secondary">Unavailable</span>
              </div>
            )}
          </div>

          {/* Add / Quantity control */}
          {item.isAvailable && (
            <div className="w-24">
              {totalInCart === 0 ? (
                <button
                  onClick={handleSimpleAdd}
                  className="w-full h-8 border-2 border-primary text-primary text-sm font-bold rounded-[var(--radius-md)] flex items-center justify-center gap-1 hover:bg-primary-50 transition-colors"
                >
                  <Plus size={14} /> ADD
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="w-full h-8 border-2 border-primary rounded-[var(--radius-md)] flex items-center justify-between px-1">
                    <button
                      onClick={handleDecrement}
                      className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary-50 rounded transition-colors"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-bold text-primary tabular-nums">{totalInCart}</span>
                    <button
                      onClick={handleSimpleAdd}
                      className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary-50 rounded transition-colors"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  {hasCustomisation && (
                    <button
                      onClick={() => setAddonOpen(true)}
                      className="text-[10px] text-primary font-medium text-center hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Addon Selector Modal */}
      <Modal
        isOpen={addonOpen}
        onClose={() => setAddonOpen(false)}
        size="sm"
        showClose={false}
        className="!p-0"
      >
        <AddonSelector
          item={item}
          restaurant={restaurant}
          onClose={() => setAddonOpen(false)}
        />
      </Modal>
    </>
  );
}
