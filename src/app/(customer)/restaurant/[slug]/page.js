"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, Clock, ChevronDown, ChevronRight,
  MapPin, Info, Heart, Share2, Search, X, Zap,
} from "lucide-react";
import MenuItemCard from "@/components/customer/MenuItemCard";
import CartBar from "@/components/customer/CartBar";
import { Toggle, Badge, CardSkeleton } from "@/components/ui";
import useRestaurantStore from "@/stores/restaurantStore";

export default function RestaurantPage({ params }) {
  const { slug } = use(params);
  const {
    selectedRestaurant: restaurant,
    menu: menuData,
    categories,
    isLoading,
    fetchRestaurantBySlug,
    fetchMenu,
    clearSelectedRestaurant,
  } = useRestaurantStore();

  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const sectionRefs = useRef({});
  const categoryBarRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Fetch restaurant and menu
  useEffect(() => {
    const load = async () => {
      const rest = await fetchRestaurantBySlug(slug);
      if (rest?._id) {
        await fetchMenu(rest._id);
      }
    };
    load();
    return () => clearSelectedRestaurant();
  }, [slug]);

  // Set initial active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  // Build a category → items map from API menu data
  const categoryMap = new Map();
  menuData.forEach((group) => {
    categoryMap.set(group.category, group.items);
  });

  // All items flat (for search count)
  const allItems = menuData.flatMap((group) => group.items);

  // Filter items
  const getFilteredItems = (items) =>
    items.filter((item) => {
      if (vegOnly && !item.isVeg) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
      }
      return true;
    });

  // Scroll spy: highlight active category tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (cat) => {
    isScrollingRef.current = true;
    setActiveCategory(cat);
    sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Scroll active tab into view in category bar
    const btn = categoryBarRef.current?.querySelector(`[data-cat="${cat}"]`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setTimeout(() => { isScrollingRef.current = false; }, 800);
  };

  // Loading state
  if (isLoading && !restaurant) {
    return (
      <div className="py-4 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home" className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-40 bg-bg-secondary rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="py-4 min-h-screen flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">Restaurant not found</h3>
        <Link href="/home" className="text-sm font-semibold text-primary hover:underline">Go back home</Link>
      </div>
    );
  }

  const { name, cuisines, rating, deliverySettings, costForTwo, offers, address, timing, isVerified } = restaurant;
  const { average: ratingVal, totalReviews } = rating;
  const { avgDeliveryTime, deliveryFee, freeDeliveryAbove, minOrderAmount } = deliverySettings;

  const isOpen = timing?.isOpen ?? true;
  const totalItemsInSearch = searchQuery
    ? allItems.filter((i) => {
        const q = searchQuery.toLowerCase();
        return i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
      }).length
    : 0;

  return (
    <div className="pb-24">

      {/* ── BACK BUTTON (mobile sticky) ── */}
      <div className="sticky top-[var(--header-height)] left-0 right-0 pointer-events-none" style={{ zIndex: 10 }}>
        <div className="pointer-events-auto absolute top-3 left-0">
          <Link
            href="/home"
            className="flex items-center gap-1.5 bg-white shadow-[var(--shadow-md)] text-text-primary text-sm font-medium rounded-[var(--radius-full)] px-3 py-2 hover:bg-bg-hover transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* ── HERO COVER ── */}
      <div className="relative -mx-4 md:-mx-6 h-52 md:h-64 bg-gradient-to-br from-orange-200 via-red-100 to-orange-300 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center select-none">
            <div className="text-8xl md:text-9xl opacity-30">🍛</div>
          </div>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Restaurant name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{name}</h1>
          <p className="text-white/80 text-sm mt-0.5">{cuisines?.join(" · ")}</p>
        </div>

        {/* Top actions */}
        <div className="absolute top-14 right-4 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart size={16} className={isLiked ? "text-error fill-error" : "text-text-secondary"} />
          </button>
          <button className="w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
            <Share2 size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* ── RESTAURANT INFO CARD ── */}
      <div className="bg-white -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-3 border-b border-border-light">

        {/* Status + badges */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOpen ? "bg-success-light text-success" : "bg-error-light text-error"}`}>
            {isOpen ? "● Open" : "● Closed"}
          </span>
          {isVerified && (
            <span className="text-xs font-medium text-info bg-info-light px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-white ${ratingVal >= 4 ? "bg-success" : ratingVal >= 3 ? "bg-warning" : "bg-error"}`}>
              <Star size={10} fill="white" strokeWidth={0} /> {ratingVal}
            </div>
            <span className="text-xs text-text-secondary">{totalReviews?.toLocaleString()} ratings</span>
          </div>
          <div className="w-px h-4 bg-border-light" />
          {/* Delivery time */}
          <div className="flex items-center gap-1 text-sm">
            <Clock size={14} className="text-text-tertiary" />
            <span className="font-semibold text-text-primary">{avgDeliveryTime} mins</span>
          </div>
          <div className="w-px h-4 bg-border-light" />
          {/* Cost for two */}
          {costForTwo && (
            <div className="text-sm">
              <span className="font-semibold text-text-primary">₹{costForTwo}</span>
              <span className="text-text-tertiary text-xs ml-1">for two</span>
            </div>
          )}
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-text-tertiary" />
            {address?.area}, {address?.city}
          </span>
          <span>·</span>
          <span>
            {deliveryFee > 0
              ? freeDeliveryAbove
                ? `₹${deliveryFee} delivery · Free above ₹${freeDeliveryAbove}`
                : `₹${deliveryFee} delivery charge`
              : "Free delivery"}
          </span>
          {minOrderAmount > 0 && (
            <>
              <span>·</span>
              <span>Min order ₹{minOrderAmount}</span>
            </>
          )}
        </div>

        {/* More info expandable */}
        <button
          onClick={() => setInfoExpanded(!infoExpanded)}
          className="flex items-center gap-1 text-xs font-medium text-primary mt-2 hover:underline"
        >
          <Info size={12} />
          {infoExpanded ? "Less info" : "More info"}
          <ChevronDown size={12} className={`transition-transform ${infoExpanded ? "rotate-180" : ""}`} />
        </button>
        {infoExpanded && (
          <div className="mt-3 pt-3 border-t border-border-light grid grid-cols-2 gap-2 text-xs text-text-secondary">
            <div><span className="font-medium text-text-primary">Timings</span><br />{timing?.openTime} – {timing?.closeTime}</div>
            <div><span className="font-medium text-text-primary">Address</span><br />{address?.fullAddress}</div>
          </div>
        )}
      </div>

      {/* ── OFFERS ── */}
      {offers?.length > 0 && (
        <div className="bg-white -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b border-border-light">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {offers.map((offer, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 bg-success-light rounded-[var(--radius-lg)] px-3 py-2">
                <Zap size={14} className="text-success shrink-0" />
                <span className="text-xs font-semibold text-success-dark">{offer.description}</span>
                <span className="text-[10px] font-bold text-success border border-success/30 px-1.5 py-0.5 rounded">
                  {offer.code}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH + VEG FILTER ── */}
      <div className="bg-white -mx-4 md:-mx-6 px-4 md:px-6 py-3 border-b border-border-light flex items-center gap-3">
        {showSearch ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search within menu…"
                className="w-full h-9 pl-9 pr-9 text-sm bg-bg-secondary rounded-[var(--radius-full)] focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary/20 border border-transparent focus:border-primary placeholder:text-text-tertiary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="text-sm font-medium text-primary shrink-0">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 flex-1 h-9 px-3 bg-bg-secondary rounded-[var(--radius-full)] text-sm text-text-tertiary hover:bg-bg-tertiary transition-colors"
            >
              <Search size={14} /> Search in menu
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-veg">Veg</span>
              <Toggle checked={vegOnly} onChange={setVegOnly} size="sm" />
            </div>
          </>
        )}
      </div>

      {/* ── SEARCH RESULTS ── */}
      {searchQuery && (
        <div className="py-4">
          <p className="text-sm text-text-secondary mb-3">
            {totalItemsInSearch === 0 ? (
              <span>No items found for <strong>&quot;{searchQuery}&quot;</strong></span>
            ) : (
              <span><strong>{totalItemsInSearch}</strong> items found for <strong>&quot;{searchQuery}&quot;</strong></span>
            )}
          </p>
          {categories.map((cat) => {
            const filtered = getFilteredItems(categoryMap.get(cat) || []);
            if (filtered.length === 0) return null;
            return (
              <div key={cat} className="mb-4">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">{cat}</p>
                {filtered.map((item) => (
                  <MenuItemCard key={item._id} item={item} restaurant={restaurant} />
                ))}
              </div>
            );
          })}
          {totalItemsInSearch === 0 && (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-text-secondary text-sm">Try different keywords</p>
            </div>
          )}
        </div>
      )}

      {/* ── CATEGORY NAV + MENU ── (hidden when searching) */}
      {!searchQuery && (
        <div className="flex gap-0 mt-0">

          {/* Left: sticky category sidebar (desktop) */}
          <div className="hidden md:block w-48 shrink-0">
            <div className="sticky top-[calc(var(--header-height)+160px)] max-h-[60vh] overflow-y-auto py-4 pr-2 scrollbar-hide">
              {categories.map((cat) => {
                const filtered = getFilteredItems(categoryMap.get(cat) || []);
                return (
                  <button
                    key={cat}
                    onClick={() => scrollToCategory(cat)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-[var(--radius-md)] transition-all mb-0.5 flex items-center justify-between group ${
                      activeCategory === cat
                        ? "bg-primary-50 text-primary font-semibold border-l-2 border-primary"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-xs ml-1 shrink-0 ${activeCategory === cat ? "text-primary" : "text-text-tertiary"}`}>
                      {filtered.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: menu items */}
          <div className="flex-1 min-w-0">
            {/* Mobile category tabs */}
            <div
              ref={categoryBarRef}
              className="md:hidden sticky bg-white border-b border-border-light flex gap-0 overflow-x-auto scrollbar-hide -mx-4 px-4"
              style={{ top: `calc(var(--header-height) + 165px)`, zIndex: 5 }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  data-cat={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeCategory === cat
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu sections */}
            <div className="pt-4">
              {categories.map((cat) => {
                const filtered = getFilteredItems(categoryMap.get(cat) || []);
                if (filtered.length === 0 && vegOnly) return null;
                return (
                  <section
                    key={cat}
                    ref={(el) => (sectionRefs.current[cat] = el)}
                    data-category={cat}
                    className="mb-2"
                  >
                    {/* Category header */}
                    <div className="py-3">
                      <h2 className="text-base font-bold text-text-primary">{cat}</h2>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Items */}
                    {filtered.length > 0 ? (
                      filtered.map((item) => (
                        <MenuItemCard key={item._id} item={item} restaurant={restaurant} />
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-sm text-text-tertiary">No veg items in this category</p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── CART BAR ── */}
      <CartBar />
    </div>
  );
}
