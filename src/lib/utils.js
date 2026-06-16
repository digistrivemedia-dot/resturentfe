/**
 * Merge class names, filtering out falsy values
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format price to Indian currency
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaults = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  };
  return d.toLocaleDateString("en-IN", defaults);
}

/**
 * Format date to relative time (e.g., "2 mins ago")
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "min", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, length = 100) {
  if (!str) return "";
  return str.length > length ? str.slice(0, length) + "..." : str;
}

/**
 * Generate slug from string
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get rating color based on value
 */
export function getRatingColor(rating) {
  if (rating >= 4) return "var(--rating-green)";
  if (rating >= 3) return "var(--rating-yellow)";
  return "var(--rating-red)";
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format phone number (Indian)
 */
export function formatPhone(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Calculate distance between two coordinates (km)
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Order status to display text and color
 */
export const ORDER_STATUS_MAP = {
  placed: { label: "Order Placed", color: "info" },
  confirmed: { label: "Confirmed", color: "info" },
  preparing: { label: "Preparing", color: "warning" },
  ready: { label: "Ready", color: "warning" },
  picked_up: { label: "Picked Up", color: "primary" },
  out_for_delivery: { label: "Out for Delivery", color: "primary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};
