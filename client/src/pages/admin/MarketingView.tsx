import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Zap,
  Tag,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function MarketingView() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"flashSale" | "coupons" | "sliders">(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("coupons")) return "coupons";
      if (window.location.pathname.includes("sliders")) return "sliders";
    }
    return "flashSale";
  });

  useEffect(() => {
    if (location.includes("coupons")) {
      setActiveTab("coupons");
    } else if (location.includes("sliders")) {
      setActiveTab("sliders");
    } else if (location.includes("flash-sale")) {
      setActiveTab("flashSale");
    }
  }, [location]);

  // FLASH SALE STATE
  const { data: flashSale, refetch: refetchFlash } = trpc.admin.flashSale.get.useQuery();
  const updateFlashMutation = trpc.admin.flashSale.update.useMutation();
  const [flashName, setFlashName] = useState("");
  const [flashStartDate, setFlashStartDate] = useState("");
  const [flashEndDate, setFlashEndDate] = useState("");
  const [flashDiscount, setFlashDiscount] = useState(25);
  const [flashIsActive, setFlashIsActive] = useState(true);

  // Sync initial flash sale values
  React.useEffect(() => {
    if (flashSale) {
      setFlashName(flashSale.name || "Eid Mega Flash Sale");
      setFlashStartDate(flashSale.startDate || "2025-04-01");
      setFlashEndDate(flashSale.endDate || "2025-04-15");
      setFlashDiscount(flashSale.discountPercentage || 25);
      setFlashIsActive(Boolean(flashSale.isActive));
    }
  }, [flashSale]);

  const handleSaveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateFlashMutation.mutateAsync({
        name: flashName,
        startDate: flashStartDate,
        endDate: flashEndDate,
        discountPercentage: flashDiscount,
        isActive: flashIsActive,
      });
      toast.success("Flash Sale settings updated!");
      refetchFlash();
    } catch (err: any) {
      toast.error("Failed to update flash sale");
    }
  };

  // COUPONS STATE
  const { data: coupons = [], refetch: refetchCoupons } = trpc.admin.coupons.list.useQuery();
  const saveCouponMutation = trpc.admin.coupons.save.useMutation();
  const deleteCouponMutation = trpc.admin.coupons.delete.useMutation();
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponId, setCouponId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(300);
  const [usageLimit, setUsageLimit] = useState<number>(200);
  const [expiryDate, setExpiryDate] = useState("2025-12-31");
  const [isCouponActive, setIsCouponActive] = useState(true);

  const openAddCoupon = () => {
    setCouponId(null);
    setCode(`SAVE${Math.floor(10 + Math.random() * 90)}`);
    setDiscountType("percentage");
    setDiscountValue(15);
    setMinOrderAmount(1200);
    setMaxDiscount(300);
    setUsageLimit(100);
    setExpiryDate("2025-12-31");
    setIsCouponActive(true);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCouponMutation.mutateAsync({
        id: couponId || undefined,
        code: code.toUpperCase().trim(),
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        expiryDate,
        isActive: isCouponActive,
      });
      toast.success(couponId ? "Coupon updated!" : "Coupon created!");
      setIsCouponModalOpen(false);
      refetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Failed to save coupon");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Delete this coupon code?")) return;
    try {
      await deleteCouponMutation.mutateAsync({ id });
      toast.success("Coupon deleted");
      refetchCoupons();
    } catch (err) {
      toast.error("Error deleting coupon");
    }
  };

  // SLIDERS STATE
  const { data: sliders = [], refetch: refetchSliders } = trpc.admin.sliders.list.useQuery();
  const saveSliderMutation = trpc.admin.sliders.save.useMutation();
  const deleteSliderMutation = trpc.admin.sliders.delete.useMutation();
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [sliderId, setSliderId] = useState<number | null>(null);
  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderSubtitle, setSliderSubtitle] = useState("");
  const [sliderButtonText, setSliderButtonText] = useState("Order Now");
  const [sliderButtonUrl, setSliderButtonUrl] = useState("/category/1");
  const [sliderDesktopImg, setSliderDesktopImg] = useState("");
  const [sliderPriority, setSliderPriority] = useState(1);
  const [isSliderActive, setIsSliderActive] = useState(true);

  const openAddSlider = () => {
    setSliderId(null);
    setSliderTitle("100% Pure Organic Forest Honey");
    setSliderSubtitle("Direct from Sundarbans apiaries to your home");
    setSliderButtonText("Shop Now");
    setSliderButtonUrl("/category/1");
    setSliderDesktopImg("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=80");
    setSliderPriority(sliders.length + 1);
    setIsSliderActive(true);
    setIsSliderModalOpen(true);
  };

  const handleSaveSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSliderMutation.mutateAsync({
        id: sliderId || undefined,
        title: sliderTitle,
        subtitle: sliderSubtitle,
        buttonText: sliderButtonText,
        buttonUrl: sliderButtonUrl,
        desktopImageUrl: sliderDesktopImg,
        priority: sliderPriority,
        isActive: isSliderActive,
      });
      toast.success(sliderId ? "Slider updated!" : "Slider created!");
      setIsSliderModalOpen(false);
      refetchSliders();
    } catch (err: any) {
      toast.error("Failed to save slider");
    }
  };

  const handleDeleteSlider = async (id: number) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteSliderMutation.mutateAsync({ id });
      toast.success("Banner deleted");
      refetchSliders();
    } catch (err) {
      toast.error("Error deleting banner");
    }
  };

  return (
    <AdminLayout
      pageTitle="Marketing, Flash Sales &amp; Banners"
      breadcrumbs={[{ label: "Marketing" }]}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Promotions &amp; Marketing Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure flash sales, discount voucher codes, and homepage banner slides.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("flashSale")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "flashSale"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Zap size={15} />
          <span>Flash Sale Campaign</span>
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "coupons"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag size={15} />
          <span>Coupons &amp; Vouchers ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sliders")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "sliders"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders size={15} />
          <span>Hero Sliders &amp; Banners ({sliders.length})</span>
        </button>
      </div>

      {/* TAB 1: FLASH SALE */}
      {activeTab === "flashSale" && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <span>Timed Flash Sale Event</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Display live countdown ticking timer and banner ribbons on storefront.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={flashIsActive}
                onChange={(e) => setFlashIsActive(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Campaign Active</span>
            </label>
          </div>

          <form onSubmit={handleSaveFlashSale} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campaign Headline / Title
              </label>
              <input
                type="text"
                value={flashName}
                onChange={(e) => setFlashName(e.target.value)}
                placeholder="e.g. Ramadan Special Flash Sale"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={flashStartDate}
                  onChange={(e) => setFlashStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date (Countdown Target)
                </label>
                <input
                  type="date"
                  value={flashEndDate}
                  onChange={(e) => setFlashEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Flash Discount %
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={flashDiscount}
                  onChange={(e) => setFlashDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={updateFlashMutation.isPending}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {updateFlashMutation.isPending ? "Saving..." : "Save Flash Sale Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: COUPONS */}
      {activeTab === "coupons" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddCoupon}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus size={16} />
              <span>Create Coupon Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-base font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg inline-block">
                        {c.code}
                      </span>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${c.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT OFF`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Min order: ৳{c.minOrderAmount}
                      {c.maxDiscount ? ` • Max cap: ৳${c.maxDiscount}` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Expires: {c.expiryDate}</span>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SLIDERS */}
      {activeTab === "sliders" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddSlider}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus size={16} />
              <span>Add Banner Slide</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sliders.map((slider) => (
              <div
                key={slider.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col"
              >
                <div className="h-44 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={slider.desktopImageUrl}
                    alt={slider.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Priority #{slider.priority}
                    </span>
                    <h4 className="font-bold text-base leading-tight">{slider.title}</h4>
                    {slider.subtitle && (
                      <p className="text-xs text-slate-200 mt-0.5">{slider.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${slider.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Link: {slider.buttonUrl}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Create Coupon Voucher
            </h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Coupon Code (e.g. GBNEW20)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Min Order (৳)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Max Cap (৳)</label>
                  <input
                    type="number"
                    value={maxDiscount || ""}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SLIDER */}
      {isSliderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Hero Banner
            </h3>
            <form onSubmit={handleSaveSlider} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Headline</label>
                <input
                  type="text"
                  required
                  value={sliderTitle}
                  onChange={(e) => setSliderTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Subtitle</label>
                <input
                  type="text"
                  value={sliderSubtitle}
                  onChange={(e) => setSliderSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={sliderDesktopImg}
                  onChange={(e) => setSliderDesktopImg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">CTA Button Text</label>
                  <input
                    type="text"
                    value={sliderButtonText}
                    onChange={(e) => setSliderButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Link</label>
                  <input
                    type="text"
                    value={sliderButtonUrl}
                    onChange={(e) => setSliderButtonUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSliderModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
