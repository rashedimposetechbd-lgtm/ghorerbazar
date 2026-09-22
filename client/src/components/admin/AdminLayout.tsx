import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingBag,
  Users,
  Percent,
  Sliders,
  Home,
  Menu as MenuIcon,
  FileText,
  Image,
  Truck,
  Settings,
  Globe,
  UserCheck,
  History,
  BarChart3,
  Search,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  badge?: number | string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AdminLayout({
  children,
  pageTitle,
  breadcrumbs = [],
}: {
  children: React.ReactNode;
  pageTitle: string;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  const [location, setLocation] = useLocation();
  const { admin, logout, hasPermission } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Live queries for real badges
  const { data: settings } = trpc.admin.settings.get.useQuery();
  const { data: rawNotifs, refetch: refetchNotifs } = trpc.admin.notifications.list.useQuery();
  const notifications = Array.isArray(rawNotifs) ? rawNotifs : [];
  const markReadMutation = trpc.admin.notifications.markRead.useMutation();
  const markAllReadMutation = trpc.admin.notifications.markAllRead.useMutation();
  const { data: rawProducts } = trpc.admin.products.list.useQuery();
  const productsList = Array.isArray(rawProducts) ? rawProducts : [];
  const { data: rawOrders } = trpc.admin.orders.list.useQuery();
  const ordersList = Array.isArray(rawOrders) ? rawOrders : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingOrdersCount = ordersList.filter((o) => o.orderStatus === "pending").length;
  const lowStockCount = productsList.filter((p) => p.stock <= p.lowStockThreshold).length;

  const siteName = settings?.siteName || "Babui Shop";

  const navGroups: NavGroup[] = [
    {
      group: "Overview",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: "dashboard" },
      ],
    },
    {
      group: "Catalog",
      items: [
        {
          name: "Products",
          href: "/admin/products",
          icon: Package,
          permission: "products",
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
        },
        { name: "Categories", href: "/admin/categories", icon: Layers, permission: "categories" },
        { name: "Brands", href: "/admin/brands", icon: Tag, permission: "brands" },
      ],
    },
    {
      group: "Sales & CRM",
      items: [
        {
          name: "Orders",
          href: "/admin/orders",
          icon: ShoppingBag,
          permission: "orders",
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        },
        { name: "Customers", href: "/admin/customers", icon: Users, permission: "customers" },
      ],
    },
    {
      group: "Marketing",
      items: [
        { name: "Flash Sale", href: "/admin/flash-sale", icon: Zap, permission: "marketing" },
        { name: "Coupons", href: "/admin/coupons", icon: Percent, permission: "coupons" },
        { name: "Hero Sliders", href: "/admin/sliders", icon: Sliders, permission: "sliders" },
      ],
    },
    {
      group: "Storefront & Content",
      items: [
        { name: "Homepage Builder", href: "/admin/homepage", icon: Home, permission: "homepage" },
        { name: "Header & Menu", href: "/admin/header-nav", icon: MenuIcon, permission: "settings" },
        { name: "CMS Pages", href: "/admin/pages", icon: FileText, permission: "pages" },
        { name: "Media Library", href: "/admin/media", icon: Image, permission: "media" },
      ],
    },
    {
      group: "Configuration",
      items: [
        { name: "Website Settings", href: "/admin/settings", icon: Settings, permission: "settings" },
        { name: "Shipping & Payment", href: "/admin/shipping-payment", icon: Truck, permission: "settings" },
        { name: "SEO & Social", href: "/admin/seo", icon: Globe, permission: "seo" },
        { name: "Admin Users & RBAC", href: "/admin/users", icon: UserCheck, permission: "all" },
        { name: "Activity Logs", href: "/admin/activity-logs", icon: History, permission: "all" },
        { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3, permission: "dashboard" },
      ],
    },
  ];

  // Quick Global Search Filter
  const filteredNavItems = globalSearch.trim()
    ? navGroups
        .flatMap((g) => g.items)
        .filter((item) => item.name.toLowerCase().includes(globalSearch.toLowerCase()))
    : [];

  const handleNotificationClick = async (notifId: number, link?: string) => {
    await markReadMutation.mutateAsync({ id: notifId });
    refetchNotifs();
    setShowNotifications(false);
    if (link) setLocation(link);
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
    refetchNotifs();
  };

  return (
    <div className={`min-h-screen flex bg-slate-50 text-slate-900 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : ""}`}>
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:z-40 flex flex-col border-r transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } w-72 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-sm ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            {settings?.siteLogo ? (
              <img src={settings.siteLogo} alt={siteName} className="w-10 h-10 object-contain rounded-xl shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                {siteName.charAt(0)}
              </div>
            )}
            <div className={`flex flex-col min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                {siteName}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Admin CMS
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors lg:hidden"
            title="Close sidebar"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                <h3 className={`px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 ${isCollapsed ? "lg:hidden" : ""}`}>
                  {group.group}
                </h3>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || (item.href !== "/admin/dashboard" && location.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        size={19}
                        className={`shrink-0 transition-colors ${
                          isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        }`}
                      />
                      <span className={`truncate flex-1 ${isCollapsed ? "lg:hidden" : ""}`}>{item.name}</span>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-full shrink-0 ${
                            isCollapsed ? "lg:hidden" : ""
                          } ${
                            String(item.badge).includes("Low")
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isCollapsed && item.badge && (
                        <span className="hidden lg:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Current Admin Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {admin?.name?.charAt(0) || "A"}
              </div>
              <div className={`flex flex-col min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
                <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                  {admin?.name || "Admin"}
                </span>
                <span className="text-[10px] text-slate-400 capitalize truncate">
                  {admin?.role?.replace("_", " ") || "Administrator"}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className={`p-1 text-slate-400 hover:text-rose-600 transition-colors ${isCollapsed ? "lg:hidden" : ""}`}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"} pl-0`}>
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 sm:px-6">
          {/* Breadcrumbs / Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
              aria-label="Open sidebar"
            >
              <MenuIcon size={20} />
            </button>

            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                <Link href="/admin/dashboard" className="hover:text-slate-700 dark:hover:text-slate-300">
                  Admin
                </Link>
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    <span>/</span>
                    {b.href ? (
                      <Link href={b.href} className="hover:text-slate-700 dark:hover:text-slate-300">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400">{b.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Global Search Bar & Actions */}
          <div className="flex items-center gap-3">
            {/* Global quick navigation search */}
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search modules, pages..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
              />
              {/* Dropdown search suggestions */}
              {isSearchFocused && filteredNavItems.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setLocation(item.href);
                        setGlobalSearch("");
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <item.icon size={14} className="text-slate-400" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Live Storefront Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all"
              title="Open public store website in new tab"
            >
              <span>View Store</span>
              <ExternalLink size={13} />
            </a>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 transition-colors"
                title="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications at the moment
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id, notif.link)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 ${
                            !notif.isRead ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {notif.type === "order" && (
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                                <ShoppingBag size={14} />
                              </div>
                            )}
                            {notif.type === "stock" && (
                              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                                <AlertCircle size={14} />
                              </div>
                            )}
                            {notif.type === "customer" && (
                              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                                <Users size={14} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar Profile Popover */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {admin?.name?.charAt(0) || "A"}
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {admin?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{admin?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full capitalize">
                      {admin?.role?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Settings size={14} />
                      <span>System Settings</span>
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserCheck size={14} />
                      <span>Users &amp; Roles</span>
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY VIEW */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
