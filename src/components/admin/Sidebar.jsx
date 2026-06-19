"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, ShoppingBag, Bike,
  Ticket, DollarSign, BarChart3, Star, Bell, Settings,
  Image, ScrollText, ChevronLeft, Menu, X,
} from "lucide-react";
import { APP_NAME } from "@/constants";
import useUiStore from "@/stores/uiStore";
import useAuthStore from "@/stores/authStore";

const menuItems = [
  { href: "/admin/dashboard",         label: "Dashboard",         icon: LayoutDashboard },
  { href: "/admin/restaurants",       label: "Restaurants",       icon: Store },
  { href: "/admin/customers",         label: "Customers",         icon: Users },
  { href: "/admin/orders",            label: "Orders",            icon: ShoppingBag },
  { href: "/admin/delivery-partners", label: "Delivery Partners", icon: Bike },
  { href: "/admin/coupons",           label: "Coupons",           icon: Ticket },
  { href: "/admin/finance",           label: "Revenue & Payouts", icon: DollarSign },
  { href: "/admin/analytics",         label: "Analytics",         icon: BarChart3 },
  { href: "/admin/reviews",           label: "Reviews",           icon: Star },
  { href: "/admin/cms",               label: "CMS / Banners",     icon: Image },
  { href: "/admin/notifications",     label: "Notifications",     icon: Bell },
  { href: "/admin/settings",          label: "Settings",          icon: Settings },
  { href: "/admin/logs",              label: "Activity Logs",     icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed, isSidebarOpen, setSidebarOpen } = useUiStore();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#1A1A2E] text-white
          flex flex-col transition-all duration-300 z-50
          ${isSidebarCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"}
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div
          className="flex items-center justify-between px-4 border-b border-white/10 shrink-0"
          style={{ height: "var(--header-height)" }}
        >
          {!isSidebarCollapsed && (
            <Link href="/admin/dashboard" className="text-lg font-extrabold text-primary truncate">
              {APP_NAME}
              <span className="ml-1.5 text-xs font-medium text-white/40">Admin</span>
            </Link>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-white/60 hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-[var(--radius-md)] text-white/60 hover:bg-white/10 transition-colors"
            >
              {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-[var(--radius-md)]
                  text-sm font-medium transition-colors group
                  ${isActive
                    ? "bg-[#FF5722]/20 text-[#FF8A65]"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                  }
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}

                {/* Collapsed tooltip */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer — admin info */}
        {!isSidebarCollapsed && (
          <div className="px-4 py-3 border-t border-white/10 shrink-0">
            <p className="text-xs font-semibold text-white/70 truncate">{user?.name || "Admin User"}</p>
            <p className="text-[10px] text-white/30 truncate mt-0.5">{user?.email || "admin@cafesriisha.com"}</p>
          </div>
        )}
      </aside>
    </>
  );
}
