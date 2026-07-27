"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/customer/Header";
import BottomNav from "@/components/customer/BottomNav";
import LiveOrderBar from "@/components/customer/LiveOrderBar";
import CartBar from "@/components/customer/CartBar";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

// Auth pages — no layout chrome
const AUTH_PATHS = ["/login", "/verify-otp", "/complete-profile"];

// Browsable without login — show header/nav but no auth gate
const BROWSE_PATHS = ["/home", "/search", "/restaurant", "/category"];

// Pages where the floating "view cart" bar shouldn't show (already on/past cart)
const HIDE_CARTBAR_PATHS = ["/cart", "/checkout", "/payment"];

export default function CustomerLayout({ children }) {
  const pathname = usePathname();

  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isAuth) return <>{children}</>;

  const isBrowse = BROWSE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const showCartBar = !HIDE_CARTBAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Browsable pages: show header/nav, no auth gate
  if (isBrowse) {
    return (
      <>
        <Header />
        <main
          className="flex-1"
          style={{ paddingBottom: "var(--bottom-nav-height)" }}
        >
          <div
            className="mx-auto px-4 md:px-6"
            style={{ maxWidth: "var(--max-content-width)" }}
          >
            {children}
          </div>
        </main>
        <LiveOrderBar />
        {showCartBar && <CartBar />}
        <BottomNav />
      </>
    );
  }

  // Protected pages (cart, checkout, orders, profile, etc.): require customer role
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <Header />
      <main
        className="flex-1"
        style={{ paddingBottom: "var(--bottom-nav-height)" }}
      >
        <div
          className="mx-auto px-4 md:px-6"
          style={{ maxWidth: "var(--max-content-width)" }}
        >
          {children}
        </div>
      </main>
      <LiveOrderBar />
      {showCartBar && <CartBar />}
      <BottomNav />
    </ProtectedRoute>
  );
}
