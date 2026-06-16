"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ClipboardList, User } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages
  const hideOn = ["/login", "/verify-otp", "/complete-profile", "/checkout", "/payment"];
  if (hideOn.some((path) => pathname.startsWith(path))) {
    return null;
  }

  // Don't show on order tracking page
  if (pathname.match(/\/order\/.*\/track/)) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-light"
      style={{
        zIndex: "var(--z-sticky)",
        height: "var(--bottom-nav-height)",
      }}
    >
      <div className="flex items-center justify-around h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/home" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5
                transition-colors text-xs font-medium
                ${isActive ? "text-primary" : "text-text-tertiary"}
              `}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
