"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNER_COLORS = [
  "from-orange-400 to-red-500",
  "from-purple-500 to-indigo-600",
  "from-green-400 to-teal-500",
];

const BANNER_EMOJIS = ["🍕", "🍔", "🍛"];

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);

  // Default demo banners if none provided
  const items = banners.length > 0 ? banners : [
    { _id: "b1", title: "50% OFF on your first order!", subtitle: "Use code FIRST50", link: "/home", gradient: BANNER_COLORS[0], emoji: "🎉" },
    { _id: "b2", title: "Free delivery this weekend!", subtitle: "On orders above ₹299", link: "/home", gradient: BANNER_COLORS[1], emoji: "🚀" },
    { _id: "b3", title: "Biryani Festival", subtitle: "Flat ₹99 off all biryanis", link: "/category/biryani", gradient: BANNER_COLORS[2], emoji: "🍚" },
  ];

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <div className="relative rounded-[var(--radius-2xl)] overflow-hidden h-36 md:h-44 select-none">
      {/* Slides */}
      {items.map((item, idx) => (
        <Link
          key={item._id}
          href={item.link || "/home"}
          className={`absolute inset-0 bg-gradient-to-r ${item.gradient || BANNER_COLORS[idx % 3]} flex items-center justify-between px-6 md:px-10 transition-opacity duration-500 ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <div className="text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">Limited Time</p>
            <h3 className="text-xl md:text-2xl font-extrabold leading-tight mb-1">{item.title}</h3>
            <p className="text-sm text-white/80">{item.subtitle}</p>
            <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors">
              Order Now →
            </span>
          </div>
          <div className="text-6xl md:text-7xl opacity-90">{item.emoji}</div>
        </Link>
      ))}

      {/* Arrow buttons */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
        <ChevronLeft size={16} />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === current ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
