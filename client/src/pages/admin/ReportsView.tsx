import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Calendar,
  Download,
  Printer,
  CreditCard,
  Layers,
  ArrowUpRight,
  Sparkles,
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
import { toast } from "sonner";

const COLORS = ["#059669", "#0284c7", "#d97706", "#7c3aed", "#e11d48", "#14b8a6"];

export default function ReportsView() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "this_month" | "all">("30d");

  const { data: stats, isLoading } = trpc.admin.dashboard.stats.useQuery();
  const { data: orders = [] } = trpc.admin.orders.list.useQuery();
  const { data: products = [] } = trpc.admin.products.list.useQuery();

  // Metrics Calculation
  const totalRevenue = stats?.totalSales || 0;
  const estimatedProfit = Math.round(totalRevenue * 0.32);
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered");
  const aov = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  // Payment Method Breakdown
  const paymentMethodMap: Record<string, { count: number; total: number }> = {};
  orders.forEach((o) => {
    const method = o.paymentMethod || "cod";
    if (!paymentMethodMap[method]) {
      paymentMethodMap[method] = { count: 0, total: 0 };
    }
    paymentMethodMap[method].count += 1;
    paymentMethodMap[method].total += o.total;
  });

  const paymentChartData = Object.entries(paymentMethodMap).map(([method, data]) => ({
    name:
      method === "cod"
        ? "Cash on Delivery"
        : method === "bkash"
        ? "bKash"
        : method === "nagad"
        ? "Nagad"
        : method.toUpperCase(),
    value: data.total,
    count: data.count,
  }));

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error("No orders data to export");
      return;
    }

    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Subtotal",
      "Discount",
      "Shipping Fee",
      "Total Amount",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleDateString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ghorer-bazar-sales-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Sales report downloaded successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout
      pageTitle="Analytics &amp; Financial Reports"
      breadcrumbs={[{ label: "Overview", href: "/admin/dashboard" }, { label: "Reports" }]}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Performance Intelligence &amp; Revenue Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Exportable business summaries, margins, customer basket metrics, and order fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gross Turnover
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
              ৳
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block tracking-tight">
            ৳{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp size={13} />
            <span>Past 30 days active cash flow</span>
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Est. Gross Margin
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block tracking-tight">
            ৳{estimatedProfit.toLocaleString()}
          </span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
            ~32.0% operational contribution
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block tracking-tight">
            ৳{aov.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {orders.length} transactions
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Delivery Success Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 block tracking-tight">
            {orders.length > 0
              ? `${Math.round(
                  ((orders.filter((o) => o.orderStatus === "delivered").length) / orders.length) * 100
                )}%`
              : "100%"}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {orders.filter((o) => o.orderStatus === "delivered").length} orders successfully closed
          </span>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Profit */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Monthly Turnover &amp; Estimated Margins
              </h3>
              <p className="text-xs text-slate-400">Past 6 months growth track</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {stats?.monthlyRevenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyRevenueData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`]}
                  />
                  <Legend verticalAlign="top" iconType="circle" />
                  <Bar dataKey="revenue" name="Total Revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Gross Margin" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading analytics...
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Revenue by Payment Channel
            </h3>
            <p className="text-xs text-slate-400">COD vs Mobile Wallets</p>
          </div>
          <div className="h-56 w-full flex-1">
            {paymentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentChartData.map((_, index) => (
                      <Cell key={`pay-cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, "Volume"]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => (
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{val}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No payment data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP PERFORMING PRODUCTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Top Selling Catalog Items
            </h3>
            <p className="text-xs text-slate-400">Ranked by volume &amp; turnover contribution</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
              <tr>
                <th className="py-2.5 font-semibold">Rank</th>
                <th className="py-2.5 font-semibold">Product Title</th>
                <th className="py-2.5 font-semibold">Units Sold</th>
                <th className="py-2.5 font-semibold">Gross Revenue</th>
                <th className="py-2.5 font-semibold">Current Stock</th>
                <th className="py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats?.topProducts?.map((p, idx) => {
                const catalogItem = products.find((prod) => prod.name === p.name);

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        {catalogItem?.imageUrl && (
                          <img
                            src={catalogItem.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">
                      {p.quantity} units
                    </td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{p.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">
                      {catalogItem ? `${catalogItem.stock} in stock` : "N/A"}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-full">
                        High Velocity
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
