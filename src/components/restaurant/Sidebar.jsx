"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Puzzle,
  FolderOpen, Ticket, Star, BarChart3, Store, Settings,
  HelpCircle, CreditCard, ChevronLeft, Menu, ChevronDown, X,
} from "lucide-react";
import { APP_NAME } from "@/constants";
import useUiStore from "@/stores/uiStore";
import { useState } from "react";

const PENDING_ORDERS = 3; // mock live count

const menuItems = [
  { href: "/restaurant/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/restaurant/orders",     label: "Orders",         icon: ShoppingBag, badge: PENDING_ORDERS },
  { href: "/restaurant/menu",       label: "Menu",           icon: UtensilsCrossed },
  { href: "/restaurant/addons",     label: "Addons",         icon: Puzzle },
  { href: "/restaurant/categories", label: "Categories",     icon: FolderOpen },
  { href: "/restaurant/coupons",    label: "Coupons & Offers", icon: Ticket },
  { href: "/restaurant/reviews",    label: "Reviews",        icon: Star },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { href: "/restaurant/analytics/sales",  label: "Sales" },
      { href: "/restaurant/analytics/orders", label: "Orders" },
      { href: "/restaurant/analytics/items",  label: "Item Performance" },
    ],
  },
  { href: "/restaurant/profile",  label: "Profile",   icon: Store },
  { href: "/restaurant/payments", label: "Payments",  icon: CreditCard },
  { href: "/restaurant/settings", label: "Settings",  icon: Settings },
  { href: "/restaurant/support",  label: "Support",   icon: HelpCircle },
];

function NavItem({ item, collapsed, pathname, openGroup, setOpenGroup }) {
  if (item.children) {
    const isChildActive = item.children.some((c) => pathname.startsWith(c.href));
    const isOpen = openGroup === item.label;

    return (
      <div className="mb-0.5">
        <button
          onClick={() => setOpenGroup(isOpen ? null : item.label)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
            isChildActive ? "text-primary bg-primary-50" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
          }`}
          title={collapsed ? item.label : undefined}
        >
          <item.icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
        {!collapsed && isOpen && (
          <div className="ml-9 mt-0.5 flex flex-col gap-0.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`text-sm px-3 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                  pathname === child.href
                    ? "text-primary font-medium bg-primary-50"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = pathname === item.href || (item.href !== "/restaurant/dashboard" && pathname.startsWith(item.href + "/"));

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors group relative ${
        isActive ? "bg-primary-50 text-primary" : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon size={18} className="shrink-0" />
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {item.badge > 0 && (
        <span className={`text-[10px] font-extrabold rounded-full flex items-center justify-center ${
          collapsed ? "absolute -top-1 -right-1 w-4 h-4 bg-error text-white" : "w-5 h-5 bg-error text-white"
        }`}>
          {item.badge}
        </span>
      )}
      {/* Tooltip for collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          {item.label}
          {item.badge > 0 && ` (${item.badge})`}
        </div>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed, isSidebarOpen, setSidebarOpen } = useUiStore();
  const [openGroup, setOpenGroup] = useState("Analytics");

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-bg-primary border-r border-border-light
          flex flex-col transition-all duration-300 z-50
          ${isSidebarCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"}
          lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div
          className="flex items-center justify-between px-4 border-b border-border-light shrink-0"
          style={{ height: "var(--header-height)" }}
        >
          {!isSidebarCollapsed && (
            <Link href="/restaurant/dashboard" className="text-lg font-extrabold text-primary truncate">
              {APP_NAME}
              <span className="ml-1 text-xs font-medium text-text-tertiary">Restaurant</span>
            </Link>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors"
            >
              <X size={18} />
            </button>
            {/* Desktop collapse */}
            <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors"
            >
              {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          {menuItems.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              collapsed={isSidebarCollapsed}
              pathname={pathname}
              openGroup={openGroup}
              setOpenGroup={setOpenGroup}
            />
          ))}
        </nav>

        {/* Collapse hint (desktop, expanded) */}
        {!isSidebarCollapsed && (
          <div className="hidden lg:block px-4 py-3 border-t border-border-light">
            <p className="text-[10px] text-text-tertiary">DigiStrive Restaurant v1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
