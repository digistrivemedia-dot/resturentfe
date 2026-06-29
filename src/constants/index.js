// App info
export const APP_NAME = "Sri Isha Cafe";
export const APP_TAGLINE = "Delicious food, delivered fast";

// API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Cuisines
export const CUISINES = [
  { value: "north_indian",  label: "North Indian",  icon: "🍛",  image: "/north-indian.jpg" },
  { value: "south_indian",  label: "South Indian",  icon: "🥘",  image: "/south-indian.jpeg" },
  { value: "chinese",       label: "Chinese",       icon: "🥡",  image: "/chinese.jpg" },
  { value: "italian",       label: "Italian",       icon: "🍕",  image: "/Italian.jpg" },
  { value: "continental",   label: "Continental",   icon: "🥗",  image: "/continental.jpg" },
  { value: "mughlai",       label: "Mughlai",       icon: "🍗",  image: "/mughal.jpg" },
  { value: "street_food",   label: "Street Food",   icon: "🌮",  image: "/street-food.jpg" },
  { value: "desserts",      label: "Desserts",      icon: "🍰",  image: "/dessert.jpeg" },
  { value: "beverages",     label: "Beverages",     icon: "🥤",  image: "/beverages.png" },
  { value: "biryani",       label: "Biryani",       icon: "🍚",  image: "/biryani.jpg" },
  { value: "pizza",         label: "Pizza",         icon: "🍕",  image: "/Italian.jpg" },
  { value: "burgers",       label: "Burgers",       icon: "🍔",  image: "/Burger.jpg" },
  { value: "rolls",         label: "Rolls",         icon: "🌯",  image: "/biryani.jpg" },
  { value: "thali",         label: "Thali",         icon: "🍽️",  image: "/south-indian.jpeg" },
  { value: "seafood",       label: "Seafood",       icon: "🦐",  image: "/continental.jpg" },
  { value: "healthy",       label: "Healthy",       icon: "🥬",  image: "/south-indian.jpeg" },
];

// Sort options
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating: High to Low" },
  { value: "delivery_time", label: "Delivery Time" },
  { value: "cost_low", label: "Cost: Low to High" },
  { value: "cost_high", label: "Cost: High to Low" },
];

// Filter options
export const FILTER_OPTIONS = {
  dietary: [
    { value: "veg", label: "Pure Veg" },
    { value: "non_veg", label: "Non-Veg" },
    { value: "vegan", label: "Vegan" },
  ],
  rating: [
    { value: "4.5", label: "4.5+" },
    { value: "4.0", label: "4.0+" },
    { value: "3.5", label: "3.5+" },
  ],
  deliveryTime: [
    { value: "30", label: "Under 30 mins" },
    { value: "45", label: "Under 45 mins" },
    { value: "60", label: "Under 60 mins" },
  ],
  costForTwo: [
    { value: "300", label: "Under ₹300" },
    { value: "500", label: "₹300 - ₹500" },
    { value: "800", label: "₹500 - ₹800" },
    { value: "1000", label: "Above ₹800" },
  ],
};

// Order statuses
export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "ready",
  "picked_up",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

// Payment methods
export const PAYMENT_METHODS = [
  { value: "online", label: "Pay Online", description: "UPI, Cards, Net Banking, Wallets" },
  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
  { value: "wallet", label: "Wallet", description: "Pay from your wallet balance" },
];

// Tip options
export const TIP_OPTIONS = [0, 20, 30, 50];

// Address labels
export const ADDRESS_LABELS = [
  { value: "home", label: "Home", icon: "Home" },
  { value: "work", label: "Work", icon: "Briefcase" },
  { value: "other", label: "Other", icon: "MapPin" },
];

// Spice levels
export const SPICE_LEVELS = [
  { value: "mild", label: "Mild", color: "#4CAF50" },
  { value: "medium", label: "Medium", color: "#FF9800" },
  { value: "hot", label: "Hot", color: "#F44336" },
  { value: "extra_hot", label: "Extra Hot", color: "#B71C1C" },
];

// Menu item tags
export const ITEM_TAGS = [
  { value: "bestseller", label: "Bestseller" },
  { value: "new", label: "New" },
  { value: "chef_special", label: "Chef's Special" },
  { value: "must_try", label: "Must Try" },
];

// Restaurant status options (admin)
export const RESTAURANT_STATUSES = [
  { value: "pending", label: "Pending Approval", color: "warning" },
  { value: "active", label: "Active", color: "success" },
  { value: "suspended", label: "Suspended", color: "error" },
  { value: "closed", label: "Closed", color: "default" },
];

// Date range presets (analytics)
export const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Map defaults (India center)
export const MAP_DEFAULTS = {
  center: { lat: 19.076, lng: 72.8777 }, // Mumbai
  zoom: 13,
};
