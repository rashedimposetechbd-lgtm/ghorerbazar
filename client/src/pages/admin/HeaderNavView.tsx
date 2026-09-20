import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Bell,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function HeaderNavView() {
  const utils = trpc.useUtils();
  const { data: settings, refetch: refetchSettings } = trpc.admin.settings.get.useQuery();
  const { data: initialNavItems = [], refetch: refetchNav } = trpc.admin.navMenu.get.useQuery();
  const updateSettingsMutation = trpc.admin.settings.update.useMutation();
  const updateNavMutation = trpc.admin.navMenu.update.useMutation();

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [sitePhone, setSitePhone] = useState("");
  const [siteWhatsApp, setSiteWhatsApp] = useState("");
  const [headerHotlineEnabled, setHeaderHotlineEnabled] = useState(true);
  const [headerWhatsAppEnabled, setHeaderWhatsAppEnabled] = useState(true);

  const [navItems, setNavItems] = useState<any[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("/");

  React.useEffect(() => {
    if (settings) {
      setAnnouncementText(settings.announcementText ?? "");
      setAnnouncementEnabled(settings.announcementEnabled ?? true);
      setSitePhone(settings.sitePhone ?? "");
      setSiteWhatsApp(settings.siteWhatsApp ?? "");
      setHeaderHotlineEnabled(settings.headerHotlineEnabled ?? true);
      setHeaderWhatsAppEnabled(settings.headerWhatsAppEnabled ?? true);
    }
  }, [settings]);

  React.useEffect(() => {
    if (initialNavItems.length > 0 && navItems.length === 0) {
      setNavItems([...initialNavItems].sort((a, b) => a.order - b.order));
    }
  }, [initialNavItems]);

  const handleSaveHeaderSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync({
        announcementText,
        announcementEnabled,
        sitePhone,
        siteWhatsApp,
        headerHotlineEnabled,
        headerWhatsAppEnabled,
      });
      await utils.admin.settings.get.invalidate();
      await utils.storefront.settings.invalidate();
      toast.success("Header & Announcement bar settings updated!");
      refetchSettings();
    } catch (err: any) {
      toast.error("Failed to update settings");
    }
  };

  const moveNavItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= navItems.length) return;

    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    copy.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setNavItems(copy);
  };

  const toggleNavItem = (index: number) => {
    const copy = [...navItems];
    copy[index].isEnabled = !copy[index].isEnabled;
    setNavItems(copy);
  };

  const removeNavItem = (id: number) => {
    setNavItems(navItems.filter((item) => item.id !== id));
  };

  const addNavItem = () => {
    if (!newItemTitle.trim() || !newItemUrl.trim()) return;
    const newItem = {
      id: Date.now(),
      title: newItemTitle.trim(),
      url: newItemUrl.trim(),
      type: "custom" as const,
      order: navItems.length + 1,
      isEnabled: true,
    };
    setNavItems([...navItems, newItem]);
    setNewItemTitle("");
    setNewItemUrl("");
  };

  const handleSaveNavItems = async () => {
    try {
      await updateNavMutation.mutateAsync(navItems);
      await utils.admin.navMenu.get.invalidate();
      await utils.storefront.navMenu.invalidate();
      toast.success("Navigation menu updated!");
      refetchNav();
    } catch (err: any) {
      toast.error("Failed to update navigation menu");
    }
  };

  return (
    <AdminLayout
      pageTitle="Header &amp; Navigation Menu"
      breadcrumbs={[{ label: "Storefront" }, { label: "Header & Menu" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Header Bars &amp; Navigation Customizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify the top announcement ribbon, hotline numbers, and header menu links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOPBAR & ANNOUNCEMENT SETTINGS */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bell size={18} className="text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Top Announcement Ribbon &amp; Contact Hotlines
            </h3>
          </div>

          <form onSubmit={handleSaveHeaderSettings} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Announcement Ribbon Text
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500">Enable Ribbon</span>
                </label>
              </div>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Free delivery over ৳1,500 • Support: +8809642922922"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Hotline
                </label>
                <input
                  type="text"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={siteWhatsApp}
                  onChange={(e) => setSiteWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={headerHotlineEnabled}
                  onChange={(e) => setHeaderHotlineEnabled(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Display Call Us Button in Header</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={headerWhatsAppEnabled}
                  onChange={(e) => setHeaderWhatsAppEnabled(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Display WhatsApp Chat Link in Header</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs"
              >
                Save Header Settings
              </button>
            </div>
          </form>
        </div>

        {/* NAVIGATION MENU ITEMS */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MenuIcon size={18} className="text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Main Navigation Bar Items
                </h3>
              </div>
              <button
                onClick={handleSaveNavItems}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-500"
              >
                Save Menu
              </button>
            </div>

            {/* Add new link row */}
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Link Title (e.g. Ramadan Offer)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border focus:outline-none"
              />
              <input
                type="text"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                placeholder="/category/1 or /page/about"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border focus:outline-none"
              />
              <button
                onClick={addNavItem}
                className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold shrink-0"
              >
                Add Link
              </button>
            </div>

            {/* Menu items list */}
            <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
              {navItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    item.isEnabled
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      : "bg-slate-50 dark:bg-slate-800/40 border-dashed opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {item.order}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{item.url}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleNavItem(index)}
                      className={`p-1 rounded ${
                        item.isEnabled ? "text-emerald-600" : "text-slate-400"
                      }`}
                      title={item.isEnabled ? "Disable" : "Enable"}
                    >
                      {item.isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      disabled={index === 0}
                      onClick={() => moveNavItem(index, "up")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      disabled={index === navItems.length - 1}
                      onClick={() => moveNavItem(index, "down")}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => removeNavItem(item.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
