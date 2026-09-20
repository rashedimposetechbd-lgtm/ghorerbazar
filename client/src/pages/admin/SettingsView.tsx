import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Settings,
  Building,
  Truck,
  CreditCard,
  Share2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Upload,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsView() {
  const [location, setLocation] = useLocation();
  const { data: settings, refetch, isLoading } = trpc.admin.settings.get.useQuery();
  const updateMutation = trpc.admin.settings.update.useMutation();

  const { data: gateways = [], refetch: refetchGateways } =
    trpc.admin.shippingPayment.getPaymentGateways.useQuery();
  const updateGatewaysMutation = trpc.admin.shippingPayment.updatePaymentGateways.useMutation();

  const [activeTab, setActiveTab] = useState<"general" | "shipping" | "payment" | "seo" | "social">(() => {
    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("shipping-payment")) return "shipping";
      if (window.location.pathname.includes("seo")) return "seo";
    }
    return "general";
  });

  useEffect(() => {
    if (location.includes("shipping-payment")) {
      setActiveTab("shipping");
    } else if (location.includes("seo")) {
      setActiveTab("seo");
    } else if (location === "/admin/settings") {
      setActiveTab("general");
    }
  }, [location]);

  // SEO state
  const [metaTitle, setMetaTitle] = useState("Ghorer Bazar - Pure & Organic Food in Bangladesh");
  const [metaDescription, setMetaDescription] = useState("Order 100% pure honey, cold pressed mustard oil, ghee, organic dates and groceries across Bangladesh.");
  const [metaKeywords, setMetaKeywords] = useState("organic food, pure honey, mustard oil, ghee, ghorerbazar, bangladesh");
  const [ogImageUrl, setOgImageUrl] = useState("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80");
  const [robotsIndex, setRobotsIndex] = useState(true);

  // General state
  const [siteName, setSiteName] = useState("");
  const [siteTagline, setSiteTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [siteEmail, setSiteEmail] = useState("");
  const [sitePhone, setSitePhone] = useState("");
  const [siteWhatsApp, setSiteWhatsApp] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  // Shipping state
  const [shippingFeeDhaka, setShippingFeeDhaka] = useState(70);
  const [shippingFeeOutside, setShippingFeeOutside] = useState(130);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);

  // Payment state
  const [codEnabled, setCodEnabled] = useState(true);
  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadEnabled, setNagadEnabled] = useState(true);
  const [nagadNumber, setNagadNumber] = useState("");
  const [rocketEnabled, setRocketEnabled] = useState(false);

  // Social state
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialYouTube, setSocialYouTube] = useState("");
  const [socialTikTok, setSocialTikTok] = useState("");

  // Sync state
  React.useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || "Ghorer Bazar");
      setSiteTagline(settings.siteTitle || "Pure and Safe Food in Bangladesh");
      setLogoUrl(settings.siteLogo || "");
      setFaviconUrl(settings.siteFavicon || "");
      setSiteEmail(settings.siteEmail || "support@ghorerbazar.com");
      setSitePhone(settings.sitePhone || "+8809642922922");
      setSiteWhatsApp(settings.siteWhatsApp || "+8801700000000");
      setSiteAddress(settings.siteAddress || "House 12, Road 4, Dhanmondi, Dhaka 1205");

      setShippingFeeDhaka(settings.shippingInsideDhaka ?? 70);
      setShippingFeeOutside(settings.shippingOutsideDhaka ?? 130);
      setFreeShippingThreshold(settings.freeShippingThreshold ?? 1500);

      setSocialFacebook(settings.facebookUrl || "https://facebook.com/ghorerbazarbd");
      setSocialInstagram(settings.instagramUrl || "https://instagram.com/ghorerbazar");
      setSocialYouTube(settings.youtubeUrl || "https://youtube.com/@ghorerbazar");
      setSocialTikTok(settings.tiktokUrl || "https://tiktok.com/@ghorerbazar");
    }
  }, [settings]);

  React.useEffect(() => {
    if (gateways && gateways.length > 0) {
      const cod = gateways.find((g) => g.id === "cod");
      const bkash = gateways.find((g) => g.id === "bkash");
      const nagad = gateways.find((g) => g.id === "nagad");
      const rocket = gateways.find((g) => g.id === "rocket");

      if (cod) setCodEnabled(cod.isEnabled);
      if (bkash) {
        setBkashEnabled(bkash.isEnabled);
        if (bkash.merchantNumber) setBkashNumber(bkash.merchantNumber);
      }
      if (nagad) {
        setNagadEnabled(nagad.isEnabled);
        if (nagad.merchantNumber) setNagadNumber(nagad.merchantNumber);
      }
      if (rocket) setRocketEnabled(rocket.isEnabled);
    }
  }, [gateways]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        siteName,
        siteTitle: siteTagline,
        siteLogo: logoUrl,
        siteFavicon: faviconUrl,
        siteEmail,
        sitePhone,
        siteWhatsApp,
        siteAddress,
        shippingInsideDhaka: shippingFeeDhaka,
        shippingOutsideDhaka: shippingFeeOutside,
        freeShippingThreshold,
        facebookUrl: socialFacebook,
        instagramUrl: socialInstagram,
        youtubeUrl: socialYouTube,
        tiktokUrl: socialTikTok,
      });

      // Update payment gateways
      await updateGatewaysMutation.mutateAsync([
        {
          id: "cod",
          name: "Cash on Delivery",
          isEnabled: codEnabled,
          mode: "live",
          instructions: "Pay with cash upon delivery",
        },
        {
          id: "bkash",
          name: "bKash Payment",
          isEnabled: bkashEnabled,
          mode: "live",
          merchantNumber: bkashNumber || "017XXXXXXXX",
          instructions: "Pay via bKash Merchant or Send Money",
        },
        {
          id: "nagad",
          name: "Nagad Payment",
          isEnabled: nagadEnabled,
          mode: "live",
          merchantNumber: nagadNumber || "018XXXXXXXX",
          instructions: "Pay via Nagad Merchant or Send Money",
        },
        {
          id: "rocket",
          name: "DBBL Rocket",
          isEnabled: rocketEnabled,
          mode: "live",
          instructions: "Pay via DBBL Rocket bill pay",
        },
      ]);

      toast.success("Settings saved successfully!");
      refetch();
      refetchGateways();
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    }
  };

  return (
    <AdminLayout
      pageTitle="Global Settings &amp; Configuration"
      breadcrumbs={[{ label: "Settings" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Storefront &amp; System Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure branding, delivery fees, payment gateways, and contact channels.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("general")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building size={15} />
          <span>General &amp; Branding</span>
        </button>

        <button
          onClick={() => setActiveTab("shipping")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "shipping"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck size={15} />
          <span>Delivery &amp; Shipping Charges</span>
        </button>

        <button
          onClick={() => setActiveTab("payment")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "payment"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard size={15} />
          <span>Payment Methods (COD &amp; MFS)</span>
        </button>

        <button
          onClick={() => setActiveTab("seo")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "seo"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Search size={15} />
          <span>SEO &amp; Meta Tags</span>
        </button>

        <button
          onClick={() => setActiveTab("social")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "social"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Share2 size={15} />
          <span>Social Media Links</span>
        </button>
      </div>

      {/* FORM WRAPPER */}
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Company Identity &amp; Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Company / Website Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Slogan / Tagline</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Favicon URL</label>
                <input
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://.../favicon.ico"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Support Email</label>
                <input
                  type="email"
                  value={siteEmail}
                  onChange={(e) => setSiteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Customer Hotline Phone</label>
                <input
                  type="text"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">WhatsApp Hotline</label>
                <input
                  type="text"
                  value={siteWhatsApp}
                  onChange={(e) => setSiteWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Physical Store &amp; Office Address</label>
              <textarea
                rows={2}
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* SHIPPING TAB */}
        {activeTab === "shipping" && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Delivery Rates &amp; Free Shipping Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Inside Dhaka Shipping Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingFeeDhaka}
                  onChange={(e) => setShippingFeeDhaka(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: ৳70</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Outside Dhaka Shipping Fee (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={shippingFeeOutside}
                  onChange={(e) => setShippingFeeOutside(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: ৳130</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Free Shipping Threshold (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Orders above this qualify for free shipping</span>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT TAB */}
        {activeTab === "payment" && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Payment Gateways &amp; Methods
            </h3>

            {/* COD */}
            <div className="p-4 rounded-xl border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Cash on Delivery (COD)</h4>
                <p className="text-[11px] text-slate-400">Pay cash upon parcel delivery across all 64 districts.</p>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
            </div>

            {/* bKash */}
            <div className="p-4 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">bKash (Merchant / Personal)</h4>
                  <p className="text-[11px] text-slate-400">Accept digital payments via bKash send money or payment.</p>
                </div>
                <input
                  type="checkbox"
                  checked={bkashEnabled}
                  onChange={(e) => setBkashEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </div>
              {bkashEnabled && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">bKash Account Number</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full max-w-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Nagad</h4>
                  <p className="text-[11px] text-slate-400">Accept mobile banking payments via Nagad.</p>
                </div>
                <input
                  type="checkbox"
                  checked={nagadEnabled}
                  onChange={(e) => setNagadEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
              </div>
              {nagadEnabled && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nagad Account Number</label>
                  <input
                    type="text"
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    className="w-full max-w-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Search Engine Optimization (SEO) &amp; OpenGraph Metadata
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Global Meta Title (Title Tag)</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Recommended length: 50-60 characters ({metaTitle.length} characters)
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Global Meta Description</label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Recommended length: 150-160 characters ({metaDescription.length} characters)
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Focus Meta Keywords</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="organic food, pure honey, mustard oil..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">OpenGraph / Social Share Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                  {ogImageUrl && (
                    <div className="w-10 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                      <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="robotsIndex"
                  checked={robotsIndex}
                  onChange={(e) => setRobotsIndex(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="robotsIndex" className="font-semibold text-slate-700 dark:text-slate-300">
                  Allow Search Engines to Index Storefront (robots: index, follow)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === "social" && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Social Channels &amp; Community Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Facebook Page URL</label>
                <input
                  type="url"
                  value={socialFacebook}
                  onChange={(e) => setSocialFacebook(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Instagram Profile URL</label>
                <input
                  type="url"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">YouTube Channel URL</label>
                <input
                  type="url"
                  value={socialYouTube}
                  onChange={(e) => setSocialYouTube(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">TikTok Profile URL</label>
                <input
                  type="url"
                  value={socialTikTok}
                  onChange={(e) => setSocialTikTok(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
          >
            <Save size={15} />
            <span>{updateMutation.isPending ? "Saving..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
