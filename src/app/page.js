"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  MapPin,
  ArrowRight,
  UtensilsCrossed,
  Zap,
  BadgePercent,
  ShieldCheck,
  ChevronRight,
  Star,
  Clock,
  Phone,
  Mail,
} from "lucide-react";

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

const CATEGORIES = [
  { label: "North Indian",  image: "/north-indian.jpg" },
  { label: "South Indian", image: "/south-indian.jpeg" },
  { label: "Chinese",      image: "/chinese.jpg" },
  { label: "Italian",      image: "/Italian.jpg" },
  { label: "Biryani",      image: "/biryani.jpg" },
  { label: "Burgers",      image: "/Burger.jpg" },
  { label: "Desserts",     image: "/dessert.jpeg" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Set Your Location", desc: "Enter your delivery address to discover restaurants available near you." },
  { step: "02", title: "Browse & Order", desc: "Pick from hundreds of menus, add items to cart, and customise your order." },
  { step: "03", title: "Track & Receive", desc: "Real-time tracking keeps you informed from confirmation to your doorstep." },
];

export default function LandingPage() {
  const [location, setLocation] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── NAVBAR ── */}
      <header
        className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border-light"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Sri Isha Cafe logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-base font-bold text-text-primary tracking-tight hidden sm:inline">
              Sri Isha <span className="text-primary">Cafe</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <Link href="/home" className="hover:text-text-primary transition-colors">Browse</Link>
            <Link href="/restaurant/login" className="hover:text-text-primary transition-colors">For Restaurants</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-5 text-sm font-semibold text-text-primary border border-border-default rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-9 px-5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FFF8F5] hidden lg:block" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Copy */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-primary/20">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Now serving 500+ restaurants near you
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-text-primary leading-[1.15] tracking-tight">
              Great food,<br />
              <span className="text-primary">delivered fast.</span>
            </h1>

            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-md">
              Discover the best restaurants in your city. Fresh meals, transparent pricing, and reliable delivery — every time.
            </p>

            {/* Location search */}
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

            {/* Popular searches — text only, no emojis */}
            <div className="flex flex-wrap gap-2">
              {["South Indian", "North Indian", "Chinese", "Chaat", "Biryani", "Desserts"].map((tag) => (
                <Link
                  key={tag}
                  href="/home"
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
      <section className="py-16 px-6 md:px-10 bg-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Explore</p>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Browse by Cuisine</h2>
            </div>
            <Link href="/home" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.label}
                href="/home"
                className="group flex flex-col items-center gap-2.5"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <Image
                    src={c.image}
                    alt={c.label}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-text-secondary text-center leading-tight group-hover:text-primary transition-colors">
                  {c.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      {/* ── FOOTER ── */}
      <footer className="bg-[#111111] text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Sri Isha Cafe logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-white">
                  Sri Isha <span className="text-primary">Cafe</span>
                </span>
              </div>
              <p className="text-sm text-white/45 leading-relaxed max-w-xs">
                Connecting hungry customers with the best local restaurants. Fast, fresh, and reliable.
              </p>
              <div className="flex flex-col gap-2 mt-5">
                <a href="mailto:support@sriishacafe.com" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                  <Mail size={13} /> support@sriishacafe.com
                </a>
                <a href="tel:+918000000000" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                  <Phone size={13} /> +91 80000 00000
                </a>
              </div>
            </div>

            {[
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press"],
              },
              {
                title: "Customers",
                links: ["How It Works", "FAQs", "Track Order", "Contact Support"],
              },
              {
                title: "Restaurants",
                links: ["Partner With Us", "Restaurant Login", "Partner Support", "Terms for Partners"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/25">
            <span>© 2026 Sri Isha Cafe. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white/50 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white/50 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
