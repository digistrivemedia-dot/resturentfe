"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MapPin,
  ArrowRight,
  UtensilsCrossed,
  Zap,
  BadgePercent,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import { VegBadge } from "@/components/ui";
import api from "@/lib/api";
import useAuthStore from "@/stores/authStore";

const STATS = [
  { value: "500+", label: "Partner Restaurants" },
  { value: "50K+", label: "Happy Customers" },
  { value: "30 min", label: "Avg. Delivery Time" },
  { value: "4.8", label: "Average Rating" },
];

const FEATURES = [
  {
    Icon: UtensilsCrossed,
    title: "Extensive Selection",
    desc: "Explore hundreds of restaurants across cuisines — from neighbourhood favourites to acclaimed chains.",
  },
  {
    Icon: Zap,
    title: "Fast Delivery",
    desc: "Real-time order tracking and dedicated delivery partners keep your food hot from kitchen to door.",
  },
  {
    Icon: BadgePercent,
    title: "Exclusive Deals",
    desc: "Daily coupons, cashback offers, and free-delivery promotions curated for every order.",
  },
  {
    Icon: ShieldCheck,
    title: "Safe & Verified",
    desc: "Every restaurant is vetted, packaging is hygienic, and payments are fully secured.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Set Your Location", desc: "Enter your delivery address to discover restaurants available near you." },
  { step: "02", title: "Browse & Order", desc: "Pick from hundreds of menus, add items to cart, and customise your order." },
  { step: "03", title: "Track & Receive", desc: "Real-time tracking keeps you informed from confirmation to your doorstep." },
];

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2.5 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-border-light" />
      <div className="w-14 h-2.5 rounded-full bg-border-light" />
    </div>
  );
}

function DishCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-light overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-border-light" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-3/4 rounded-full bg-border-light" />
        <div className="h-2.5 w-1/2 rounded-full bg-border-light" />
        <div className="h-3.5 w-1/3 rounded-full bg-border-light" />
      </div>
    </div>
  );
}

function DishCard({ dish }) {
  const restaurant = dish.restaurant;
  const displayPrice = dish.discountedPrice || dish.price;
  const hasDiscount = dish.discountedPrice && dish.discountedPrice < dish.price;
  const discountPct = hasDiscount ? Math.round(((dish.price - dish.discountedPrice) / dish.price) * 100) : 0;

  return (
    <Link
      href={restaurant?.slug ? `/restaurant/${restaurant.slug}` : "/home"}
      className="group block bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-error px-1.5 py-0.5 rounded-full">
            {discountPct}% OFF
          </span>
        )}
      </div>
      <div className="p-3.5">
        <VegBadge isVeg={dish.isVeg} />
        <p className="text-sm font-bold text-text-primary line-clamp-1 mt-1.5">{dish.name}</p>
        <p className="text-xs text-text-tertiary truncate mt-0.5">{restaurant?.name}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-sm font-bold text-text-primary">₹{displayPrice}</span>
          {hasDiscount && <span className="text-xs text-text-tertiary line-through">₹{dish.price}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const [location, setLocation] = useState("");
  const [showcase, setShowcase] = useState({ categories: [], dishes: [] });
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const { isAuthenticated, user, fetchMe } = useAuthStore();

  useEffect(() => {
    api
      .get("/home/showcase")
      .then((res) => setShowcase({ categories: res.data.categories, dishes: res.data.dishes }))
      .catch(() => setShowcase({ categories: [], dishes: [] }))
      .finally(() => setShowcaseLoading(false));
  }, []);

  // Logged-in users: pull their saved addresses so the hero can greet them
  // by name and skip straight to "order now" instead of an empty input.
  useEffect(() => {
    if (isAuthenticated && !user?.addresses) {
      fetchMe();
    }
  }, [isAuthenticated, user?.addresses, fetchMe]);

  const { categories, dishes } = showcase;
  const firstName = user?.name?.split(" ")[0];
  const addresses = user?.addresses || [];
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const isLoggedIn = isAuthenticated && !!user;

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "var(--font-family)" }}>

      <SiteHeader />

      {/* ── HERO ── */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FFF8F5] hidden lg:block" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              {isLoggedIn ? "Great to have you back" : "Now serving 500+ restaurants near you"}
            </div>

            {isLoggedIn ? (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-text-primary leading-[1.15] tracking-tight">
                  Welcome back,<br />
                  <span className="text-primary">{firstName || "there"}.</span>
                </h1>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-md">
                  Good food shouldn&apos;t wait. Order from your favourites in just a few taps.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-text-primary leading-[1.15] tracking-tight">
                  Great food,<br />
                  <span className="text-primary">delivered fast.</span>
                </h1>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-md">
                  Discover the best restaurants in your city. Fresh meals, transparent pricing, and reliable delivery — every time.
                </p>
              </>
            )}

            {/* Delivery address / order CTA */}
            {isLoggedIn ? (
              defaultAddress ? (
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg">
                  <div className="flex-1 flex items-center gap-3 h-12 px-4 bg-white border border-border-default rounded-lg shadow-sm min-w-0">
                    <MapPin size={17} className="text-primary shrink-0" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide leading-none">Delivering to</p>
                      <p className="text-sm font-semibold text-text-primary truncate mt-0.5">
                        {defaultAddress.label ? `${defaultAddress.label} — ` : ""}{defaultAddress.fullAddress}
                      </p>
                    </div>
                    <Link href="/profile/addresses" className="text-xs font-semibold text-primary hover:underline shrink-0">
                      Change
                    </Link>
                  </div>
                  <Link
                    href="/home"
                    className="h-12 px-5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors whitespace-nowrap text-sm"
                  >
                    Order Now <ArrowRight size={15} strokeWidth={2.5} />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5 max-w-lg">
                  <div className="flex-1 flex items-center gap-3 h-12 px-4 bg-white border border-dashed border-primary/40 rounded-lg min-w-0">
                    <MapPin size={17} className="text-primary shrink-0" strokeWidth={2} />
                    <p className="text-sm text-text-secondary truncate">No delivery address saved yet</p>
                  </div>
                  <Link
                    href="/profile/addresses"
                    className="h-12 px-5 bg-primary text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors whitespace-nowrap text-sm"
                  >
                    Add Address <ArrowRight size={15} strokeWidth={2.5} />
                  </Link>
                </div>
              )
            ) : (
              <div className="flex gap-2.5 max-w-lg">
                <div className="relative flex-1">
                  <MapPin
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary"
                    strokeWidth={2}
                  />
                  <input
                    id="hero-location-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your delivery address…"
                    className="w-full h-12 pl-10 pr-4 text-sm bg-white border border-border-default rounded-lg shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-text-tertiary text-text-primary"
                  />
                </div>
                <Link
                  href="/home"
                  className="h-12 px-5 bg-primary text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors whitespace-nowrap text-sm"
                >
                  Find Food <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
              </div>
            )}

            {/* Popular searches — text only, no emojis */}
            <div className="flex flex-wrap gap-2">
              {["South Indian", "North Indian", "Chinese", "Chaat", "Biryani", "Desserts"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium px-3.5 py-1.5 bg-bg-secondary border border-border-light rounded-full text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="hidden lg:flex items-center justify-center">
            <Image
              src="/hero-image.png"
              alt="Delicious food delivered fast"
              width={520}
              height={420}
              className="object-contain w-full max-w-[520px] drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs font-medium text-white/65 mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {(showcaseLoading || categories.length > 0) && (
        <section className="py-16 px-6 md:px-10 bg-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Explore</p>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Browse by Category</h2>
              </div>
              <Link href="/home" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ChevronRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {showcaseLoading
                ? Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)
                : categories.map((c) => (
                    <Link
                      key={c.name}
                      href={`/home?category=${encodeURIComponent(c.name)}`}
                      className="group flex flex-col items-center gap-2.5"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                        <Image src={c.image} alt={c.name} fill sizes="64px" className="object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-text-secondary text-center leading-tight line-clamp-2 max-w-[76px] group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POPULAR DISHES ── */}
      {(showcaseLoading || dishes.length > 0) && (
        <section className="py-16 px-6 md:px-10 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Flame size={13} /> Loved by customers
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Popular Dishes</h2>
              </div>
              <Link href="/home" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Order now <ChevronRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {showcaseLoading
                ? Array.from({ length: 8 }).map((_, i) => <DishCardSkeleton key={i} />)
                : dishes.map((d) => <DishCard key={d._id} dish={d} />)}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 h-11 px-6 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-dark transition-colors"
              >
                Order Now <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      <section className="py-16 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why Sri Isha Cafe</p>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Everything you need, nothing you don't</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-bg-secondary border border-border-light hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon size={20} className="text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-text-primary mb-2 text-sm">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-6 md:px-10 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-6 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-border-light" />

            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4 relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-white flex items-center justify-center z-10">
                  <span className="text-sm font-extrabold text-primary">{step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1.5">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESTAURANT PARTNER CTA ── */}
      <section className="py-16 px-6 md:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-primary px-8 md:px-14 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "28px 28px"
            }} />

            <div className="relative text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-2">For Restaurant Owners</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Grow your restaurant with us</h2>
              <p className="text-white/75 max-w-md text-sm leading-relaxed">
                Join hundreds of partner restaurants and reach thousands of hungry customers in your area. Simple onboarding, powerful dashboard.
              </p>
            </div>

            <Link
              href="/restaurant/login"
              className="relative shrink-0 h-12 px-8 bg-white text-primary font-bold rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 text-sm whitespace-nowrap shadow-sm"
            >
              Partner With Us <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
