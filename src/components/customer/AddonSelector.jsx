"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, ChevronDown, Flame } from "lucide-react";
import { VegBadge } from "@/components/ui";
import useCartStore from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";

const SPICE_COLORS = {
  mild: { color: "bg-green-500", label: "Mild" },
  medium: { color: "bg-yellow-500", label: "Medium" },
  hot: { color: "bg-orange-500", label: "Hot" },
  extra_hot: { color: "bg-red-600", label: "Extra Hot" },
};

export default function AddonSelector({ item, restaurant, onClose, existingCartId }) {
  const { addItem, updateAddons, updateQuantity, items } = useCartStore();

  // Initial state from existing cart item if editing
  const existingItem = existingCartId ? items.find((i) => i.cartId === existingCartId) : null;

  const [quantity, setQuantity] = useState(existingItem?.quantity || 1);
  const [selectedVariant, setSelectedVariant] = useState(
    existingItem?.variant || item.variants?.[0] || null
  );
  const [selectedAddons, setSelectedAddons] = useState(
    existingItem?.addons || []
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    existingItem?.specialInstructions || ""
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [switchWarning, setSwitchWarning] = useState(false);

  const hasVariants = item.variants?.length > 0;
  const hasAddons = item.addonGroups?.length > 0;

  // Base price from variant or item price
  const basePrice = selectedVariant?.price ?? (item.discountedPrice || item.price);
  const originalPrice = selectedVariant ? null : item.discountedPrice ? item.price : null;

  // Calculate addons total
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);

  // Total price
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const isAddonSelected = (groupId, addonId) =>
    selectedAddons.some((a) => a._id === addonId);

  const toggleAddon = (group, addon) => {
    const already = isAddonSelected(group._id, addon._id);

    if (group.maxSelection === 1) {
      // Radio: replace any existing from this group
      setSelectedAddons((prev) => [
        ...prev.filter((a) => !group.addons.some((ga) => ga._id === a._id)),
        already ? null : { ...addon, groupId: group._id, groupName: group.name },
      ].filter(Boolean));
    } else {
      // Checkbox: toggle
      const currentGroupSelected = selectedAddons.filter((a) =>
        group.addons.some((ga) => ga._id === a._id)
      );
      if (already) {
        setSelectedAddons((prev) => prev.filter((a) => a._id !== addon._id));
      } else if (currentGroupSelected.length < group.maxSelection) {
        setSelectedAddons((prev) => [
          ...prev,
          { ...addon, groupId: group._id, groupName: group.name },
        ]);
      }
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      menuItem: item._id,
      name: item.name,
      price: item.discountedPrice || item.price,
      image: item.image,
      isVeg: item.isVeg,
      variant: selectedVariant,
      addons: selectedAddons,
      specialInstructions,
      quantity,
    };

    if (existingCartId) {
      updateAddons(existingCartId, selectedAddons);
      updateQuantity(existingCartId, quantity);
    } else {
      const result = addItem(
        {
          _id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          deliveryFee: restaurant.deliverySettings?.deliveryFee || 0,
          freeDeliveryAbove: restaurant.deliverySettings?.freeDeliveryAbove,
          minOrderAmount: restaurant.deliverySettings?.minOrderAmount || 0,
        },
        cartItem
      );
      if (result === "switched") setSwitchWarning(true);
    }
    onClose?.();
  };

  // Validate required addon groups
  const isValid = item.addonGroups?.every((group) => {
    if (!group.isRequired) return true;
    const selected = selectedAddons.filter((a) =>
      group.addons.some((ga) => ga._id === a._id)
    );
    return selected.length >= (group.minSelection || 1);
  }) ?? true;

  return (
    <div className="flex flex-col" style={{ maxHeight: "85vh" }}>

      {/* ── Header ── */}
      <div className="flex items-start gap-4 pb-4 border-b border-border-light shrink-0">
        {/* Food emoji / image */}
        <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-4xl shrink-0 overflow-hidden">
          🍽️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <VegBadge isVeg={item.isVeg} />
            {item.tags?.includes("bestseller") && (
              <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                ★ BESTSELLER
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-text-primary leading-snug">{item.name}</h2>
          <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">{item.description}</p>

          {/* Spice level */}
          {item.spiceLevel && item.spiceLevel !== "mild" && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex gap-0.5">
                {["mild", "medium", "hot", "extra_hot"]
                  .slice(0, ["mild", "medium", "hot", "extra_hot"].indexOf(item.spiceLevel) + 1)
                  .map((_, i) => (
                    <Flame key={i} size={12} className="text-primary" fill="currentColor" />
                  ))}
              </div>
              <span className="text-xs text-text-secondary">{SPICE_COLORS[item.spiceLevel]?.label}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-text-primary">₹{basePrice}</span>
            {originalPrice && (
              <span className="text-sm text-text-tertiary line-through">₹{originalPrice}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">

        {/* Variants */}
        {hasVariants && (
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-3">
              Choose a size{" "}
              <span className="text-xs font-normal text-error ml-1">Required</span>
            </h3>
            <div className="space-y-2">
              {item.variants.map((variant) => (
                <label
                  key={variant._id}
                  className={`flex items-center justify-between p-3 rounded-[var(--radius-lg)] border-2 cursor-pointer transition-all ${
                    selectedVariant?._id === variant._id
                      ? "border-primary bg-primary-50"
                      : "border-border-light hover:border-border-default"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedVariant?._id === variant._id
                        ? "border-primary"
                        : "border-border-default"
                    }`}>
                      {selectedVariant?._id === variant._id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{variant.name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">₹{variant.price}</span>
                  <input
                    type="radio"
                    name="variant"
                    value={variant._id}
                    checked={selectedVariant?._id === variant._id}
                    onChange={() => setSelectedVariant(variant)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Addon Groups */}
        {hasAddons && item.addonGroups.map((group) => {
          const selectedInGroup = selectedAddons.filter((a) =>
            group.addons.some((ga) => ga._id === a._id)
          );
          const isGroupRequired = group.isRequired;
          const isMulti = group.maxSelection > 1;

          return (
            <div key={group._id}>
              {/* Group header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{group.name}</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {isMulti
                      ? `Select up to ${group.maxSelection}`
                      : "Select one"}{" "}
                    {group.minSelection > 0 && `• min ${group.minSelection}`}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isGroupRequired
                    ? "bg-error-light text-error"
                    : "bg-bg-secondary text-text-tertiary"
                }`}>
                  {isGroupRequired ? "Required" : "Optional"}
                </span>
              </div>

              <div className="space-y-2">
                {group.addons.map((addon) => {
                  const isSelected = isAddonSelected(group._id, addon._id);
                  const groupFull =
                    !isSelected &&
                    selectedInGroup.length >= group.maxSelection;

                  return (
                    <label
                      key={addon._id}
                      className={`flex items-center justify-between p-3 rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                        !addon.isAvailable
                          ? "opacity-40 cursor-not-allowed bg-bg-secondary border-border-light"
                          : isSelected
                            ? "border-primary bg-primary-50"
                            : groupFull
                              ? "border-border-light opacity-50 cursor-not-allowed"
                              : "border-border-light hover:border-border-default"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox or radio */}
                        <div className={`flex-shrink-0 transition-colors ${
                          isMulti
                            ? `w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-border-default"}`
                            : `w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-border-default"}`
                        }`}>
                          {isMulti && isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {!isMulti && isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-sm text-text-primary">{addon.name}</span>
                        {!addon.isAvailable && (
                          <span className="text-[10px] text-text-tertiary">(unavailable)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {addon.price > 0 && (
                          <span className="text-sm font-semibold text-text-primary">+₹{addon.price}</span>
                        )}
                        {addon.price === 0 && (
                          <span className="text-xs text-success font-medium">Free</span>
                        )}
                      </div>
                      <input
                        type={isMulti ? "checkbox" : "radio"}
                        disabled={!addon.isAvailable || (groupFull && !isSelected)}
                        checked={isSelected}
                        onChange={() => {
                          if (!addon.isAvailable || (groupFull && !isSelected)) return;
                          toggleAddon(group, addon);
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Special Instructions */}
        <div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm font-medium text-primary w-full text-left"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${showInstructions ? "rotate-180" : ""}`}
            />
            Add cooking instructions{" "}
            <span className="text-text-tertiary font-normal text-xs">(optional)</span>
          </button>
          {showInstructions && (
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, no onions, extra gravy…"
              rows={2}
              maxLength={200}
              className="mt-2 w-full p-3 text-sm border border-border-light rounded-[var(--radius-lg)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none placeholder:text-text-tertiary"
            />
          )}
        </div>
      </div>

      {/* ── Footer: Quantity + Add to Cart ── */}
      <div className="pt-4 border-t border-border-light shrink-0 space-y-3">
        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-primary-50 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="text-base font-bold text-text-primary w-6 text-center tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Price breakdown if addons selected */}
        {addonsTotal > 0 && (
          <div className="bg-bg-secondary rounded-[var(--radius-md)] px-3 py-2 text-xs text-text-secondary flex items-center justify-between">
            <span>Base ₹{basePrice} + Addons ₹{addonsTotal}</span>
            <span className="font-bold text-text-primary">= ₹{unitPrice} each</span>
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!isValid}
          className="w-full h-13 bg-primary text-white font-bold rounded-[var(--radius-lg)] flex items-center justify-between px-5 py-3.5 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <span>{existingCartId ? "Update Cart" : "Add to Cart"}</span>
          </div>
          <span className="text-base font-extrabold tabular-nums">₹{totalPrice}</span>
        </button>
      </div>
    </div>
  );
}
