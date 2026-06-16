"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, ChevronRight, Heart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

function getRatingColor(r) {
  if (r >= 4) return "bg-success";
  if (r >= 3) return "bg-warning";
  return "bg-error";
}

export default function RestaurantCard({ restaurant, variant = "default" }) {
  const {
    slug, name, cuisines = [], coverImage, logo,
    rating = {}, deliverySettings = {}, costForTwo, offers = [],
    isFeatured,
  } = restaurant;

  const { average: ratingVal = 4.0, totalReviews = 0 } = rating;
  const { avgDeliveryTime = 30, deliveryFee = 0, freeDeliveryAbove, minOrderAmount = 0 } = deliverySettings;
  const hasOffer = offers.length > 0;
  const firstOffer = offers[0];

  if (variant === "horizontal") {
    return (
      <Link href={`/restaurant/${slug}`} className="flex gap-4 bg-white rounded-[var(--radius-xl)] border border-border-light p-3 hover:shadow-[var(--shadow-md)] transition-all group">
        <div className="relative w-24 h-24 rounded-[var(--radius-lg)] overflow-hidden shrink-0 bg-bg-secondary">
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-100 to-red-100">
            🍽️
          </div>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-text-primary text-sm leading-tight truncate group-hover:text-primary transition-colors">{name}</h3>
            <span className={`flex items-center gap-1 text-xs font-bold text-white px-1.5 py-0.5 rounded shrink-0 ${getRatingColor(ratingVal)}`}>
              <Star size={9} fill="white" strokeWidth={0} />{ratingVal}
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-0.5 truncate">{cuisines.slice(0, 3).join(" · ")}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><Clock size={11} />{avgDeliveryTime} mins</span>
            <span>·</span>
            <span>{deliveryFee > 0 ? `₹${deliveryFee} delivery` : "Free delivery"}</span>
          </div>
          {hasOffer && (
            <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary">
              <Zap size={11} fill="currentColor" />{firstOffer.description}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/restaurant/${slug}`} className="group flex flex-col bg-white rounded-[var(--radius-xl)] overflow-hidden border border-border-light hover:shadow-[var(--shadow-lg)] transition-all">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-7xl select-none">
          🍽️
        </div>
        {/* Offer badge */}
        {hasOffer && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Zap size={11} fill="white" strokeWidth={0} />
              {firstOffer.description}
            </span>
          </div>
        )}
        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </div>
        )}
        {/* Favourite */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart size={14} className="text-text-tertiary hover:text-error transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-text-primary text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          <span className={`flex items-center gap-1 text-xs font-bold text-white px-1.5 py-0.5 rounded shrink-0 ${getRatingColor(ratingVal)}`}>
            <Star size={9} fill="white" strokeWidth={0} />{ratingVal}
          </span>
        </div>

        <p className="text-xs text-text-tertiary mb-2 line-clamp-1">
          {cuisines.slice(0, 3).join(" · ")}
        </p>

        <div className="flex items-center gap-2 text-xs text-text-secondary border-t border-border-light pt-2">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-text-tertiary" />
            {avgDeliveryTime} mins
          </span>
          <span className="text-border-default">·</span>
          <span>{deliveryFee > 0 ? `₹${deliveryFee} delivery` : "Free delivery"}</span>
          {costForTwo && (
            <>
              <span className="text-border-default">·</span>
              <span>₹{costForTwo} for two</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
