"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import useAuthStore from "@/stores/authStore";

const EXTERNAL_HOME_URL = "https://sriishacafe.in";

const ROLE_HOME = {
  customer: "/home",
  restaurant_owner: "/restaurant/dashboard",
  super_admin: "/admin/dashboard",
};

export default function SiteHeader() {
  const { isAuthenticated, user } = useAuthStore();
  const firstName = user?.name?.split(" ")[0];
  const dashboardHref = ROLE_HOME[user?.role] || "/home";

  return (
    <header
      className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border-light"
      style={{ zIndex: "var(--z-header)" }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">

        <Link href="/" className="flex items-center gap-2.5">
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
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="/home" className="hover:text-text-primary transition-colors">Browse</Link>
          <a href={EXTERNAL_HOME_URL} className="hover:text-text-primary transition-colors">Home</a>
          <Link href="/about" className="hover:text-text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
          <Link href="/restaurant/login" className="hover:text-text-primary transition-colors">For Restaurants</Link>
        </nav>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-extrabold overflow-hidden shrink-0">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={firstName || "Profile"} className="w-full h-full object-cover" />
                ) : (
                  (firstName || "U")[0].toUpperCase()
                )}
              </div>
              <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                Hi, {firstName || "there"}
              </span>
            </Link>
            <Link
              href={dashboardHref}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Order Now <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
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
        )}
      </div>
    </header>
  );
}
