"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";

const DEFAULT_BANNERS = [
  {
    _id: "b1",
    title: "50% Off on Your First Order",
    subtitle: "Use code FIRST50 · Valid today only",
    link: "/home",
    bg: "#7D2D00",           // deep burnt brown — not bright orange
    image: "/hero-image.png",
  },
  {
    _id: "b2",
    title: "Free Delivery This Weekend",
    subtitle: "On all orders above ₹299",
    link: "/home",
    bg: "#1B5E20",           // deep green
    image: "/south-indian.jpeg",
  },
  {
    _id: "b3",
    title: "South Indian Feast",
    subtitle: "Flat ₹99 off on all South Indian orders",
    link: "/category/south_indian",
    bg: "#4A1942",           // deep plum
    image: "/biryani.jpg",
  },
];

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);

  const items = banners.length > 0 ? banners : DEFAULT_BANNERS;

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <div className="relative rounded-2xl overflow-hidden h-36 md:h-52 select-none">
      {items.map((item, idx) => (
        <Link
          key={item._id}
          href={item.link || "/home"}
          className={`absolute inset-0 flex transition-opacity duration-500 ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{ backgroundColor: item.bg || "#7D2D00" }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Left — text content */}
          <div className="relative z-10 flex flex-col justify-center px-6 md:px-10 py-6 flex-1 md:max-w-[55%]">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/55 mb-2.5">
              <Tag size={10} /> Limited Time
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-1.5">
              {item.title}
            </h3>
            <p className="text-xs text-white/70 mb-4">{item.subtitle}</p>
            <span className="inline-flex self-start items-center gap-1 text-xs font-bold bg-white/15 border border-white/25 text-white px-3 py-1.5 rounded-full hover:bg-white/25 transition-colors">
              Order Now →
            </span>
          </div>

          {/* Right — food image (desktop only) */}
          {item.image && (
            <div className="hidden md:block relative w-[45%] shrink-0 overflow-hidden">
              {/* Fade gradient from left */}
              <div
                className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${item.bg || "#7D2D00"}, transparent)`,
                }}
              />
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover object-center"
                sizes="45vw"
              />
            </div>
          )}
        </Link>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/25 hover:bg-black/45 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-black/25 hover:bg-black/45 text-white rounded-full flex items-center justify-center transition-colors"
      >
        <ChevronRight size={14} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === current ? "w-5 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
