import React from "react";
import { Link } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  Zap,
  Tag,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CATEGORY_COLORS = ["#059669", "#0284c7", "#d97706", "#7c3aed", "#e11d48", "#14b8a6"];

export default function DashboardView() {
  const { data: stats, isLoading, refetch } = trpc.admin.dashboard.stats.useQuery();
  const { data: products = [] } = trpc.admin.products.list.useQuery();

  const lowStockItems = products.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  );
  const outOfStockItems = products.filter((p) => p.stock === 0);

  return (
    <AdminLayout pageTitle="Executive Dashboard" breadcrumbs={[{ label: "Overview" }]}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            E-Commerce Performance Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time sales analytics, order statuses, and inventory tracking for Ghorer Bazar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <ShoppingBag size={15} />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="font-bold text-base">৳</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ৳{(stats?.totalSales || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp size={13} />
            <span>+14.2% from last month</span>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ৳{(stats?.todaySales || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            <Clock size={13} />
            <span>{stats?.pendingOrders || 0} orders pending action</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats?.totalOrders || 0}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 font-medium">{stats?.completedOrders || 0} Delivered</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{stats?.processingOrders || 0} In Transit</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {stats?.totalCustomers || 0}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp size={13} />
            <span>+{stats?.newCustomersThisMonth || 12} new this month</span>
          </div>
        </div>
      </div>

      {/* QUICK STATUS TICKER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/orders?status=pending"
          className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/15 transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
            {stats?.pendingOrders || 0}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
              Pending Orders
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Require confirmation</p>
          </div>
        </Link>

        <Link
          href="/admin/products?stockStatus=low_stock"
          className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500/15 transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
            {stats?.lowStockProducts || 0}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 truncate">
              Low Stock Warnings
            </p>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">Needs replenishment</p>
          </div>
        </Link>

        <Link
          href="/admin/flash-sale"
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/15 transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate">
              Flash Sale Campaign
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              {stats?.activeFlashSales ? "Active & Ticking" : "Inactive"}
            </p>
          </div>
        </Link>

        <Link
          href="/admin/coupons"
          className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/15 transition-all flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Tag size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 truncate">
              Active Coupons
            </p>
            <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80">
              {stats?.activeCoupons || 0} coupons running
            </p>
          </div>
        </Link>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Line/Area Chart */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Sales &amp; Revenue Dynamics
              </h3>
              <p className="text-xs text-slate-400">Daily gross turnover (past 7 days)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue (৳)
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats?.dailySalesData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Sales"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading analytics...
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sales by Category
            </h3>
            <p className="text-xs text-slate-400">Revenue distribution</p>
          </div>
          <div className="h-56 w-full flex-1">
            {stats?.categorySalesData && stats.categorySalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categorySalesData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.categorySalesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Revenue"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span className="text-[11px] text-slate-600 dark:text-slate-300">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical sales data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Recent Customer Orders
              </h3>
              <p className="text-xs text-slate-400">Latest checkout transactions</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
                <tr>
                  <th className="py-2.5 font-semibold">Order</th>
                  <th className="py-2.5 font-semibold">Customer</th>
                  <th className="py-2.5 font-semibold">Items</th>
                  <th className="py-2.5 font-semibold">Total</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {order.orderNumber}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {order.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      ৳{order.total.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : order.orderStatus === "shipped"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : order.orderStatus === "processing"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : order.orderStatus === "cancelled"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {order.orderStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders?orderId=${order.id}`}
                        className="inline-flex items-center gap-1 p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Low Stock Alerts
              </h3>
              <p className="text-xs text-slate-400">Items below threshold</p>
            </div>
            <Link
              href="/admin/products?stockStatus=low_stock"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400"
            >
              Inventory &rarr;
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                All inventory levels are healthy!
              </div>
            ) : (
              <>
                {outOfStockItems.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-rose-600 dark:text-rose-400">
                        SKU: {p.sku} • Out of Stock (0)
                      </p>
                    </div>
                    <Link
                      href={`/admin/products?editId=${p.id}`}
                      className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-500 shrink-0"
                    >
                      Restock
                    </Link>
                  </div>
                ))}
                {lowStockItems.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        SKU: {p.sku} • {p.stock} remaining (Alert &le; {p.lowStockThreshold})
                      </p>
                    </div>
                    <Link
                      href={`/admin/products?editId=${p.id}`}
                      className="px-2 py-1 text-[11px] font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-500 shrink-0"
                    >
                      Edit Stock
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
