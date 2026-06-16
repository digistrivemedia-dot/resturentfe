"use client";

import { useState } from "react";
import {
  Package, TrendingUp, TrendingDown, Minus, Star, AlertTriangle,
  Award, ThumbsDown,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = {
  Week: {
    totalSold: 380,
    bestSeller: "Garlic Naan",
    highestRevItem: "Chicken Biryani",
    mostComplained: "Masala Chai",
    items: [
      { name: "Chicken Biryani", category: "Main Course", qty: 55, revenue: 13750, rating: 4.5, trend: "up" },
      { name: "Butter Chicken", category: "Main Course", qty: 62, revenue: 11160, rating: 4.3, trend: "up" },
      { name: "Garlic Naan", category: "Breads", qty: 88, revenue: 4400, rating: 4.6, trend: "flat" },
      { name: "Paneer Tikka", category: "Starters", qty: 41, revenue: 8200, rating: 4.2, trend: "up" },
      { name: "Dal Makhani", category: "Main Course", qty: 34, revenue: 5100, rating: 4.4, trend: "down" },
      { name: "Veg Thali", category: "Combos", qty: 28, revenue: 5600, rating: 4.1, trend: "up" },
      { name: "Raita", category: "Sides", qty: 42, revenue: 1680, rating: 4.0, trend: "flat" },
      { name: "Mango Lassi", category: "Beverages", qty: 22, revenue: 1980, rating: 4.3, trend: "up" },
      { name: "Masala Chai", category: "Beverages", qty: 8, revenue: 320, rating: 2.8, trend: "down" },
    ],
    lowPerformers: [
      { name: "Masala Chai", category: "Beverages", qty: 8, revenue: 320, rating: 2.8 },
      { name: "Gulab Jamun", category: "Desserts", qty: 4, revenue: 280, rating: 3.2 },
      { name: "Papad", category: "Sides", qty: 3, revenue: 90, rating: 3.8 },
    ],
    categories: [
      { name: "Main Course", revenue: 30010 },
      { name: "Breads", revenue: 4400 },
      { name: "Starters", revenue: 8200 },
      { name: "Combos", revenue: 5600 },
      { name: "Sides", revenue: 1770 },
      { name: "Beverages", revenue: 2300 },
      { name: "Desserts", revenue: 280 },
    ],
  },
  Month: {
    totalSold: 1482,
    bestSeller: "Garlic Naan",
    highestRevItem: "Chicken Biryani",
    mostComplained: "Masala Chai",
    items: [
      { name: "Chicken Biryani", category: "Main Course", qty: 218, revenue: 54500, rating: 4.5, trend: "up" },
      { name: "Butter Chicken", category: "Main Course", qty: 195, revenue: 35100, rating: 4.3, trend: "up" },
      { name: "Garlic Naan", category: "Breads", qty: 320, revenue: 16000, rating: 4.6, trend: "up" },
      { name: "Paneer Tikka", category: "Starters", qty: 145, revenue: 29000, rating: 4.2, trend: "flat" },
      { name: "Dal Makhani", category: "Main Course", qty: 112, revenue: 16800, rating: 4.4, trend: "down" },
      { name: "Veg Thali", category: "Combos", qty: 98, revenue: 19600, rating: 4.1, trend: "up" },
      { name: "Raita", category: "Sides", qty: 155, revenue: 6200, rating: 4.0, trend: "flat" },
      { name: "Mango Lassi", category: "Beverages", qty: 88, revenue: 7920, rating: 4.3, trend: "up" },
      { name: "Masala Chai", category: "Beverages", qty: 18, revenue: 720, rating: 2.9, trend: "down" },
    ],
    lowPerformers: [
      { name: "Masala Chai", category: "Beverages", qty: 18, revenue: 720, rating: 2.9 },
      { name: "Gulab Jamun", category: "Desserts", qty: 14, revenue: 980, rating: 3.2 },
      { name: "Papad", category: "Sides", qty: 11, revenue: 330, rating: 3.8 },
    ],
    categories: [
      { name: "Main Course", revenue: 106400 },
      { name: "Breads", revenue: 16000 },
      { name: "Starters", revenue: 29000 },
      { name: "Combos", revenue: 19600 },
      { name: "Sides", revenue: 6530 },
      { name: "Beverages", revenue: 8640 },
      { name: "Desserts", revenue: 980 },
    ],
  },
  Quarter: {
    totalSold: 4620,
    bestSeller: "Garlic Naan",
    highestRevItem: "Chicken Biryani",
    mostComplained: "Masala Chai",
    items: [
      { name: "Chicken Biryani", category: "Main Course", qty: 620, revenue: 155000, rating: 4.5, trend: "up" },
      { name: "Butter Chicken", category: "Main Course", qty: 558, revenue: 100440, rating: 4.4, trend: "up" },
      { name: "Garlic Naan", category: "Breads", qty: 900, revenue: 45000, rating: 4.7, trend: "up" },
      { name: "Paneer Tikka", category: "Starters", qty: 412, revenue: 82400, rating: 4.2, trend: "up" },
      { name: "Dal Makhani", category: "Main Course", qty: 318, revenue: 47700, rating: 4.3, trend: "flat" },
      { name: "Veg Thali", category: "Combos", qty: 290, revenue: 58000, rating: 4.1, trend: "up" },
      { name: "Raita", category: "Sides", qty: 420, revenue: 16800, rating: 4.0, trend: "flat" },
      { name: "Mango Lassi", category: "Beverages", qty: 245, revenue: 22050, rating: 4.3, trend: "up" },
      { name: "Masala Chai", category: "Beverages", qty: 38, revenue: 1520, rating: 2.7, trend: "down" },
    ],
    lowPerformers: [
      { name: "Masala Chai", category: "Beverages", qty: 38, revenue: 1520, rating: 2.7 },
      { name: "Gulab Jamun", category: "Desserts", qty: 42, revenue: 2940, rating: 3.1 },
      { name: "Papad", category: "Sides", qty: 28, revenue: 840, rating: 3.8 },
    ],
    categories: [
      { name: "Main Course", revenue: 303140 },
      { name: "Breads", revenue: 45000 },
      { name: "Starters", revenue: 82400 },
      { name: "Combos", revenue: 58000 },
      { name: "Sides", revenue: 17640 },
      { name: "Beverages", revenue: 23570 },
      { name: "Desserts", revenue: 2940 },
    ],
  },
};

const PERIODS = ["Week", "Month", "Quarter"];

const CATEGORY_COLORS = [
  "#FF5722", "#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1",
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="10" height="10" viewBox="0 0 10 10">
          <polygon
            points="5,1 6.2,3.8 9,4.1 7,6 7.6,9 5,7.5 2.4,9 3,6 1,4.1 3.8,3.8"
            fill={s <= Math.round(rating) ? "#F59E0B" : "#E5E7EB"}
          />
        </svg>
      ))}
      <span className="text-[10px] font-semibold text-text-secondary ml-1">{rating}</span>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up") return <TrendingUp size={14} className="text-emerald-500" />;
  if (trend === "down") return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-gray-400" />;
}

export default function ItemPerformance() {
  const [period, setPeriod] = useState("Week");
  const data = MOCK[period];

  const maxCatRev = Math.max(...data.categories.map((c) => c.revenue));

  const kpis = [
    {
      label: "Total Items Sold",
      value: data.totalSold.toLocaleString("en-IN"),
      sub: "Across all categories",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Best Seller",
      value: data.bestSeller,
      sub: "By quantity",
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Highest Revenue",
      value: data.highestRevItem,
      sub: "By revenue",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Most Complaints",
      value: data.mostComplained,
      sub: "Review attention needed",
      icon: ThumbsDown,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Item Performance</h1>
            <p className="text-sm text-text-secondary mt-0.5">Best sellers, ratings & item-level analytics</p>
          </div>
          <div className="flex gap-1 bg-white border border-border-light rounded-[var(--radius-lg)] p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-md)] transition-all ${
                  period === p
                    ? "bg-[#FF5722] text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <p className="text-base font-extrabold text-text-primary leading-tight">{kpi.value}</p>
              <p className="text-xs font-medium text-text-secondary mt-1">{kpi.label}</p>
              <p className="text-xs text-text-secondary mt-0.5 opacity-70">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Top Items Table */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">All Items — {period}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-light">
                  {["#", "Item", "Category", "Qty Sold", "Revenue", "Avg Rating", "Trend"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={item.name} className="border-b border-border-light last:border-0 hover:bg-bg-secondary transition-colors">
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        idx === 0 ? "bg-amber-100 text-amber-700" :
                        idx === 1 ? "bg-gray-100 text-gray-600" :
                        idx === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-bg-secondary text-text-secondary"
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-bg-secondary text-text-secondary px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-text-primary">{item.qty}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold text-[#FF5722]">{formatPrice(item.revenue)}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <StarRating rating={item.rating} />
                    </td>
                    <td className="py-3">
                      <TrendIcon trend={item.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-5">Category Revenue Breakdown</h2>
          <div className="space-y-3">
            {data.categories
              .sort((a, b) => b.revenue - a.revenue)
              .map((cat, i) => {
                const pct = Math.round((cat.revenue / maxCatRev) * 100);
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-xs font-semibold text-text-secondary">{cat.name}</span>
                      </div>
                      <span className="text-xs font-bold text-text-primary">{formatPrice(cat.revenue)}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Item Rating Distribution */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
          <h2 className="text-sm font-bold text-text-primary mb-4">Item Ratings At a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-xs font-semibold text-text-primary truncate">{item.name}</p>
                  <p className="text-[10px] text-text-secondary">{item.category}</p>
                </div>
                <div className="flex-shrink-0">
                  <StarRating rating={item.rating} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Performers */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Low Performers</h2>
              <p className="text-xs text-text-secondary">Items with fewer than 20 orders — consider reviewing or disabling</p>
            </div>
          </div>
          <div className="space-y-3">
            {data.lowPerformers.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 p-3 bg-amber-50/50 border border-amber-100 rounded-[var(--radius-lg)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <StarRating rating={item.rating} />
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-text-primary">{item.qty} sold</p>
                  <p className="text-xs text-[#FF5722] font-semibold">{formatPrice(item.revenue)}</p>
                </div>
                <div className="flex-shrink-0">
                  {item.rating < 3.5 ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600">
                      Consider removing
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                      Review needed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
