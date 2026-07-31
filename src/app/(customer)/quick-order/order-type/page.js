"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import useRestaurantStore from "@/stores/restaurantStore";
import useCartStore from "@/stores/cartStore";
import useLocationStore from "@/stores/locationStore";
import { ORDER_TYPES } from "@/constants";

function QuickOrderTypeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("restaurant");
  const { currentLocation } = useLocationStore();
  const { selectedRestaurant: restaurant, isLoading, fetchRestaurantBySlug, clearSelectedRestaurant } = useRestaurantStore();
  const { confirmQuickOrderType } = useCartStore();

  // No location or no restaurant picked yet — send back to pick one first
  useEffect(() => {
    if (!currentLocation || !slug) {
      router.replace("/quick-order/location");
    }
  }, [currentLocation, slug, router]);

  useEffect(() => {
    if (!slug) return;
    fetchRestaurantBySlug(slug);
    return () => clearSelectedRestaurant();
  }, [slug]);

  if (!currentLocation || !slug) return null;

  const handleSelect = (orderType) => {
    confirmQuickOrderType(orderType);
    router.push(`/quick-order/menu?restaurant=${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="pt-6 pb-4 px-5">
        <Link
          href="/quick-order/location"
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-3"
        >
          <ChevronLeft size={16} /> Change restaurant
        </Link>
        <h1 className="text-xl font-extrabold text-text-primary">
          {isLoading && !restaurant ? "Loading…" : restaurant?.name || "How would you like your order?"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">Choose how you&apos;d like to receive your order</p>
      </div>

      <div className="flex-1 px-5 max-w-md w-full mx-auto pb-8">
        {isLoading && !restaurant ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ORDER_TYPES.map(({ id, label, desc, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleSelect(id)}
                className="text-left p-4 rounded-[var(--radius-xl)] border-2 border-border-light hover:border-primary hover:bg-primary-50 transition-all"
              >
                <Icon size={22} className="text-primary" />
                <p className="text-sm font-bold text-text-primary mt-2.5">{label}</p>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuickOrderTypePage() {
  return (
    <Suspense>
      <QuickOrderTypeContent />
    </Suspense>
  );
}
