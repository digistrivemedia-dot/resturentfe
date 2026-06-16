"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, ChevronDown, Search, ShoppingBag, User, Bell } from "lucide-react";
import { Modal } from "@/components/ui";
import LocationSelector from "./LocationSelector";
import useAuthStore from "@/stores/authStore";
import useCartStore from "@/stores/cartStore";
import useLocationStore from "@/stores/locationStore";
import { APP_NAME } from "@/constants";

const HIDE_PATHS = ["/login", "/verify-otp", "/complete-profile"];
const HIDE_HEADER_PATHS = ["/checkout", "/payment"];

export default function Header() {
  const pathname = usePathname();
  const [locationOpen, setLocationOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const currentLocation = useLocationStore((s) => s.currentLocation);

  if (HIDE_PATHS.some((p) => pathname.startsWith(p))) return null;
  if (HIDE_HEADER_PATHS.some((p) => pathname.startsWith(p))) return null;

  const locationLabel = currentLocation?.area || currentLocation?.city || "Set location";

  return (
    <>
      <header
        className="sticky top-0 bg-bg-primary border-b border-border-light"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div
          className="mx-auto flex items-center justify-between gap-3 px-4 md:px-6"
          style={{ maxWidth: "var(--max-content-width)", height: "var(--header-height)" }}
        >
          {/* Left: Logo + Location */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/home" className="shrink-0 text-xl font-extrabold">
              <span className="text-primary">Digi</span><span className="text-text-primary">Strive</span>
            </Link>

            <button
              onClick={() => setLocationOpen(true)}
              className="hidden sm:flex items-center gap-1 group max-w-[200px] cursor-pointer"
            >
              <MapPin size={15} className="text-primary shrink-0" />
              <span className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                {locationLabel}
              </span>
              <ChevronDown size={14} className="shrink-0 text-text-tertiary group-hover:text-primary transition-colors" />
            </button>
          </div>

          {/* Center: Search (desktop) */}
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4 h-10 px-4 bg-bg-secondary rounded-[var(--radius-full)] text-sm text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors"
          >
            <Search size={15} />
            <span>Search restaurants or dishes…</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Link href="/search" className="md:hidden p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
              <Search size={20} />
            </Link>

            {isAuthenticated && (
              <Link href="/notifications" className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
              </Link>
            )}

            <Link href="/cart" className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors relative">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link href="/profile" className="p-2 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
                <User size={20} />
              </Link>
            ) : (
              <Link href="/login" className="ml-1 h-9 px-4 bg-primary text-white text-sm font-semibold rounded-[var(--radius-full)] flex items-center hover:bg-primary-dark transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <Modal isOpen={locationOpen} onClose={() => setLocationOpen(false)} title="Choose delivery location" size="sm">
        <LocationSelector onClose={() => setLocationOpen(false)} />
      </Modal>
    </>
  );
}
