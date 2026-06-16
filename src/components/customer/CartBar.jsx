"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import useCartStore from "@/stores/cartStore";

export default function CartBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const restaurant = useCartStore((s) => s.restaurant);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-[var(--bottom-nav-height)] md:bottom-0 left-0 right-0 z-[var(--z-sticky)] flex justify-center px-4 pb-3 md:pb-4 pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto w-full max-w-lg bg-primary text-white rounded-[var(--radius-xl)] px-4 py-3 flex items-center justify-between shadow-[var(--shadow-xl)] hover:bg-primary-dark transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <ShoppingBag size={16} />
          </div>
          <div>
            <div className="text-xs text-white/80 leading-none">
              {itemCount} item{itemCount > 1 ? "s" : ""} · {restaurant?.name}
            </div>
            <div className="text-sm font-bold leading-tight mt-0.5">View Cart</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">₹{Math.round(total)}</span>
          <ArrowRight size={16} />
        </div>
      </Link>
    </div>
  );
}
