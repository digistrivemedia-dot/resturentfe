"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, ArrowRight, Star, Clock, ChevronRight } from "lucide-react";
import { CUISINES } from "@/constants";

const STATS = [
  { value: "500+", label: "Restaurants" },
  { value: "50K+", label: "Happy Customers" },
  { value: "30 min", label: "Avg Delivery" },
  { value: "4.8★", label: "App Rating" },
];

const FEATURES = [
  { icon: "🍽️", title: "Huge Selection", desc: "Explore 500+ restaurants across cuisines, from local favourites to top-rated chains.", color: "bg-orange-50" },
  { icon: "⚡", title: "Lightning Fast", desc: "Real-time tracking and dedicated delivery partners ensure hot food at your door.", color: "bg-yellow-50" },
  { icon: "🏷️", title: "Best Deals", desc: "Exclusive coupons, cashback offers, and free delivery deals every single day.", color: "bg-green-50" },
  { icon: "🔒", title: "Safe & Secure", desc: "Hygienic packaging, verified restaurants, and secure payments guaranteed.", color: "bg-blue-50" },
];

export default function LandingPage() {
  const [location, setLocation] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 bg-bg-primary/95 backdrop-blur-sm border-b border-border-light" style={{ zIndex: "var(--z-header)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-primary">Digi</span><span className="text-text-primary">Strive</span>
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
            <Link href="/home" className="hover:text-text-primary transition-colors">Browse</Link>
            <Link href="/restaurant/login" className="hover:text-text-primary transition-colors">For Restaurants</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="h-9 px-4 text-sm font-semibold text-primary border border-primary rounded-[var(--radius-full)] hover:bg-primary-50 transition-colors">
              Login
            </Link>
            <Link href="/login" className="h-9 px-4 text-sm font-semibold text-white bg-primary rounded-[var(--radius-full)] hover:bg-primary-dark transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-orange-50">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-yellow-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
              500+ restaurants near you
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
              Hungry?{" "}
              <span className="text-primary">Order</span>{" "}
              <br className="hidden md:block" />
              in minutes.
            </h1>
            <p className="text-lg text-text-secondary max-w-md">
              Discover the best restaurants near you. Fresh food, fast delivery, and unbeatable offers — all in one app.
            </p>

            <div className="flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your delivery location..."
                  className="w-full h-12 pl-10 pr-4 text-sm bg-white border border-border-light rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-text-tertiary"
                />
              </div>
              <Link href="/home" className="h-12 px-5 bg-primary text-white font-semibold rounded-[var(--radius-lg)] flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-[var(--shadow-md)] whitespace-nowrap">
                Find Food <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Biryani 🍚", "Pizza 🍕", "Burgers 🍔", "Chinese 🥡", "Desserts 🍰"].map((tag) => (
                <Link key={tag} href="/home"
                  className="text-xs font-medium px-3 py-1.5 bg-white border border-border-light rounded-full hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: food card mockup */}
          <div className="hidden md:flex justify-center items-center relative">
            <div className="relative w-80">
              <div className="absolute top-4 left-4 right-4 h-56 bg-primary-100 rounded-2xl rotate-3" />
              <div className="absolute top-2 left-2 right-2 h-56 bg-primary-200/60 rounded-2xl rotate-1" />
              <div className="relative bg-white rounded-2xl shadow-[var(--shadow-xl)] overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-8xl select-none">
                  🍛
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-text-primary">Tandoori Nights</h3>
                    <span className="flex items-center gap-1 text-xs font-bold bg-success text-white px-2 py-0.5 rounded-md">
                      <Star size={10} fill="white" strokeWidth={0} /> 4.3
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">North Indian • Mughlai • Biryani</p>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1"><Clock size={12} /> 35 mins</span>
                    <span>·</span>
                    <span>₹30 delivery</span>
                    <span>·</span>
                    <span className="text-primary font-semibold">50% OFF</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-6 bg-white shadow-[var(--shadow-lg)] rounded-2xl p-3 text-center">
                <div className="text-2xl">🚀</div>
                <div className="text-xs font-bold text-text-primary">30 min</div>
                <div className="text-[10px] text-text-tertiary">delivery</div>
              </div>
              <div className="absolute -bottom-5 -left-6 bg-white shadow-[var(--shadow-lg)] rounded-2xl px-3 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center text-success font-bold text-sm">✓</div>
                <div>
                  <div className="text-xs font-bold text-success">Order Placed!</div>
                  <div className="text-[10px] text-text-tertiary">Arriving in 28 mins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-primary py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center text-white">
              <div className="text-3xl font-extrabold">{s.value}</div>
              <div className="text-sm text-white/70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUISINES ── */}
      <section className="py-14 px-4 md:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">What are you craving?</h2>
              <p className="text-text-secondary text-sm mt-1">Explore your favourite cuisine</p>
            </div>
            <Link href="/home" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              See all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {CUISINES.slice(0, 8).map((cuisine) => (
              <Link key={cuisine.value} href={`/category/${cuisine.value}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl group-hover:bg-primary-100 group-hover:scale-105 transition-all shadow-[var(--shadow-sm)]">
                  {cuisine.icon}
                </div>
                <span className="text-xs font-medium text-text-secondary text-center leading-tight group-hover:text-primary transition-colors">
                  {cuisine.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-14 px-4 md:px-8 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Why DigiStrive?</h2>
            <p className="text-text-secondary mt-2">Everything you need for a perfect food experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className={`rounded-2xl p-6 ${f.color} hover:shadow-[var(--shadow-md)] transition-shadow`}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESTAURANT CTA ── */}
      <section className="py-14 px-4 md:px-8 bg-gradient-to-r from-primary-700 to-primary">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Own a restaurant?</h2>
            <p className="text-white/80">Partner with DigiStrive and reach thousands of hungry customers in your area.</p>
          </div>
          <Link href="/restaurant/login"
            className="shrink-0 h-12 px-8 bg-white text-primary font-bold rounded-[var(--radius-full)] hover:bg-primary-50 transition-colors flex items-center gap-2 shadow-lg"
          >
            Partner With Us <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a1a1a] text-white py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-extrabold mb-3">
                <span className="text-primary">Digi</span>Strive
              </div>
              <p className="text-white/50 text-sm">Delicious food delivered fast to your door.</p>
            </div>
            {[
              { title: "Company", links: ["About Us", "Careers", "Blog"] },
              { title: "Customers", links: ["How It Works", "FAQs", "Contact"] },
              { title: "Restaurants", links: ["Partner With Us", "Restaurant Login", "Support"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-3 text-sm text-white/80">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/30 text-sm">
            © 2026 DigiStrive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
