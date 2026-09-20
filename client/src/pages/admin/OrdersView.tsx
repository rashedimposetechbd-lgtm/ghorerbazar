import React, { useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  X,
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function OrdersView() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("status");
      if (statusParam) return statusParam;
    }
    return "all";
  });
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  // Selected Order for Detail Modal / Invoice
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<any>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<any>("pending");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: orders = [], refetch, isLoading } = trpc.admin.orders.list.useQuery({
    search: search || undefined,
    status: selectedStatus,
    paymentStatus: selectedPaymentStatus,
  });

  const { data: settings } = trpc.admin.settings.get.useQuery();

  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation();

  const openOrderDetails = (order: any) => {
    setActiveOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
    setAdminNotes(order.notes || "");
  };

  const handleUpdateStatus = async () => {
    if (!activeOrder) return;
    try {
      const updated = await updateStatusMutation.mutateAsync({
        orderId: activeOrder.id,
        orderStatus: newStatus,
        paymentStatus: newPaymentStatus,
        notes: adminNotes,
      });
      setActiveOrder(updated);
      toast.success("Order status updated!");
      refetch();
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const statusTabs = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <AdminLayout
      pageTitle="Order Management &amp; Invoices"
      breadcrumbs={[{ label: "Sales" }, { label: "Orders" }]}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Customer Orders &amp; Fulfillment
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Process checkout submissions, track parcel status, and generate printable packing invoices.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800">
          {statusTabs.map((tab) => {
            const count =
              tab.key === "all"
                ? orders.length
                : orders.filter((o) => o.orderStatus === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedStatus === tab.key
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedStatus === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, customer name, phone number..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending (COD)</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="block text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {order.district}, {order.division}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ৳{order.total.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="uppercase text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {order.paymentMethod}
                        </span>
                        <span
                          className={`inline-block w-fit px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS & STATUS UPDATE MODAL */}
      {activeOrder && !isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Order {activeOrder.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 capitalize font-medium">
                    {activeOrder.orderStatus}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100"
                >
                  <Printer size={14} />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Delivery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Phone size={13} className="text-emerald-600" />
                    Customer Details
                  </h4>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {activeOrder.customerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Phone: {activeOrder.customerPhone}
                  </p>
                  {activeOrder.customerEmail && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Email: {activeOrder.customerEmail}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-600" />
                    Delivery Destination
                  </h4>
                  <p className="text-xs text-slate-800 dark:text-slate-200">
                    {activeOrder.shippingAddress}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeOrder.upazila ? `${activeOrder.upazila}, ` : ""}
                    {activeOrder.district}, {activeOrder.division}
                  </p>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Order Line Items ({activeOrder.items.length})
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-center">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeOrder.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2.5 px-3 flex items-center gap-2.5">
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-9 h-9 rounded-lg object-cover border"
                              />
                            )}
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                {item.productName}
                              </span>
                              {item.variantName && (
                                <span className="text-[10px] text-slate-400">
                                  Size: {item.variantName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                            ৳{item.price}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            &times;{item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            ৳{item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="mt-3 flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span>৳{activeOrder.subtotal.toLocaleString()}</span>
                    </div>
                    {activeOrder.couponDiscount > 0 && (
                      <div className="flex justify-between text-rose-600 font-medium">
                        <span>Coupon ({activeOrder.couponCode})</span>
                        <span>-৳{activeOrder.couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Delivery Fee</span>
                      <span>৳{activeOrder.shippingFee}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span>Grand Total</span>
                      <span>৳{activeOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Update Fulfillment &amp; Payment Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Fulfillment Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing &amp; Packed</option>
                      <option value="shipped">Shipped to Courier</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered Successfully</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Internal Admin Notes / Courier Tracking ID
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g., RedX Tracking: #RDX-998822. Packed by Asif."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updateStatusMutation.isPending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Save Status Update</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE VIEW */}
      {activeOrder && isInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="px-6 py-4 bg-slate-100 border-b flex items-center justify-between print:hidden">
              <span className="text-xs font-bold text-slate-700">Printable Invoice Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500"
                >
                  <Printer size={14} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="p-8 space-y-6 text-slate-800 text-xs">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    {settings?.siteLogo ? (
                      <img src={settings.siteLogo} alt={settings?.siteName || "Store Logo"} className="h-8 max-w-[120px] object-contain" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                        {(settings?.siteName || "S").charAt(0)}
                      </div>
                    )}
                    <span className="font-extrabold text-lg text-slate-900">
                      {settings?.siteName || "Store"}
                    </span>
                  </div>
                  {settings?.siteAddress && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {settings.siteAddress}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {settings?.sitePhone && `Hotline: ${settings.sitePhone}`}
                    {settings?.sitePhone && settings?.siteEmail && " • "}
                    {settings?.siteEmail && `Email: ${settings.siteEmail}`}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">INVOICE</h3>
                  <p className="font-bold text-slate-700 mt-0.5">{activeOrder.orderNumber}</p>
                  <p className="text-[11px] text-slate-500">
                    Date: {new Date(activeOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Billed &amp; Delivered To:
                  </h4>
                  <p className="font-bold text-slate-900 text-sm">{activeOrder.customerName}</p>
                  <p className="mt-0.5 text-slate-600">{activeOrder.shippingAddress}</p>
                  <p className="text-slate-600">
                    {activeOrder.district}, {activeOrder.division}
                  </p>
                  <p className="font-semibold text-slate-800 mt-1">Phone: {activeOrder.customerPhone}</p>
                </div>
                <div className="text-right space-y-1">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">
                    Payment Info:
                  </h4>
                  <p className="font-semibold uppercase text-slate-800">
                    Method: {activeOrder.paymentMethod}
                  </p>
                  <p className="text-slate-600 capitalize">
                    Payment Status: <strong className="text-emerald-700">{activeOrder.paymentStatus}</strong>
                  </p>
                  <p className="text-slate-600 capitalize">
                    Fulfillment: <strong>{activeOrder.orderStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-t border-b border-slate-200">
                <thead>
                  <tr className="text-slate-500 text-[10px] uppercase font-bold border-b">
                    <th className="py-2 text-left">Item Description</th>
                    <th className="py-2 text-center">Unit Price</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeOrder.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">
                        {item.productName}
                        {item.variantName && ` (${item.variantName})`}
                      </td>
                      <td className="py-2 text-center">৳{item.price}</td>
                      <td className="py-2 text-center font-bold">&times;{item.quantity}</td>
                      <td className="py-2 text-right font-bold">৳{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-1 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>৳{activeOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {activeOrder.couponDiscount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Discount:</span>
                      <span>-৳{activeOrder.couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge:</span>
                    <span>৳{activeOrder.shippingFee}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t">
                    <span>Total Payable:</span>
                    <span>৳{activeOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="pt-6 border-t text-center text-[10px] text-slate-400 space-y-1">
                <p>Thank you for shopping with {settings?.siteName || "us"}!</p>
                {settings?.sitePhone && (
                  <p>For any queries or returns, please call our hotline: {settings.sitePhone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
