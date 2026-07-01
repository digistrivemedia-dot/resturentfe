import { NextResponse } from "next/server";

// Restaurant management paths (protected) — distinct from public /restaurant/[slug] pages
const RESTAURANT_MGMT = [
  "/restaurant/dashboard",
  "/restaurant/orders",
  "/restaurant/menu",
  "/restaurant/categories",
  "/restaurant/addons",
  "/restaurant/coupons",
  "/restaurant/reviews",
  "/restaurant/profile",
  "/restaurant/settings",
  "/restaurant/payments",
  "/restaurant/analytics",
  "/restaurant/support",
];

// Customer routes that require login
const CUSTOMER_PROTECTED = [
  "/complete-profile",
  "/cart",
  "/checkout",
  "/payment",
  "/order",
  "/orders",
  "/profile",
  "/address",
  "/favorites",
  "/notifications",
  "/support",
];

// Login pages — redirect away if already authenticated
const LOGIN_PAGES = ["/login", "/verify-otp", "/restaurant/login", "/admin/login"];

function redirectTo(url, request) {
  return NextResponse.redirect(new URL(url, request.url));
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  const refreshToken = request.cookies.get("refreshToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;
  const isLoggedIn = !!refreshToken;

  // ── 1. Admin routes ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn || userRole !== "super_admin") {
      return redirectTo("/admin/login", request);
    }
  }

  // ── 2. Restaurant management routes ─────────────────────────────────────
  // /restaurant/login is open; /restaurant/[slug] (public menu) is also open.
  // Only the specific management sub-paths are protected.
  const isRestaurantMgmt = RESTAURANT_MGMT.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isRestaurantMgmt) {
    if (!isLoggedIn || userRole !== "restaurant_owner") {
      return redirectTo("/restaurant/login", request);
    }
  }

  // ── 3. Customer-only routes ──────────────────────────────────────────────
  const isCustomerProtected = CUSTOMER_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isCustomerProtected) {
    if (!isLoggedIn) {
      return redirectTo("/login", request);
    }
    // Wrong role — send them to their correct portal
    if (userRole === "super_admin") return redirectTo("/admin/dashboard", request);
    if (userRole === "restaurant_owner") return redirectTo("/restaurant/dashboard", request);
  }

  // ── 4. Redirect away from login pages if already logged in ───────────────
  // Only redirect if the user has the matching role for that portal.
  // e.g. a customer visiting /restaurant/login should see it (wrong portal),
  // not get bounced to /home.
  const isLoginPage = LOGIN_PAGES.includes(pathname);
  if (isLoginPage && isLoggedIn && userRole) {
    if (pathname === "/admin/login" && userRole === "super_admin")
      return redirectTo("/admin/dashboard", request);
    if (pathname === "/restaurant/login" && userRole === "restaurant_owner")
      return redirectTo("/restaurant/dashboard", request);
    if ((pathname === "/login" || pathname === "/verify-otp") && userRole === "customer")
      return redirectTo("/home", request);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
