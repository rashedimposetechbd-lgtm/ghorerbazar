import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Globe,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";

export default function BrandsView() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const { data: brands = [], refetch, isLoading } = trpc.admin.brands.list.useQuery();
  const { data: products = [] } = trpc.admin.products.list.useQuery();

  const saveMutation = trpc.admin.brands.save.useMutation();
  const deleteMutation = trpc.admin.brands.delete.useMutation();

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setLogoUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80");
    setBannerUrl("");
    setDescription("");
    setWebsiteUrl("");
    setSortOrder(brands.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: any) => {
    setEditingId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setLogoUrl(brand.logoUrl || "");
    setBannerUrl(brand.bannerUrl || "");
    setDescription(brand.description || "");
    setWebsiteUrl(brand.websiteUrl || "");
    setSortOrder(brand.sortOrder || 0);
    setIsActive(Boolean(brand.isActive));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: editingId || undefined,
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        logoUrl: logoUrl.trim() || null,
        bannerUrl: bannerUrl.trim() || undefined,
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      });

      toast.success(editingId ? "Brand updated successfully!" : "Brand created successfully!");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save brand");
    }
  };

  const handleDelete = async (id: number, brandName: string) => {
    const brandProducts = products.filter((p) => p.brandId === id);
    if (brandProducts.length > 0) {
      if (
        !window.confirm(
          `Warning: ${brandProducts.length} product(s) are currently associated with "${brandName}". Are you sure you want to delete this brand?`
        )
      ) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete brand "${brandName}"?`)) {
        return;
      }
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Brand deleted successfully!");
      refetch();
    } catch (err: any) {
      toast.error("Failed to delete brand");
    }
  };

  const activeCount = brands.filter((b) => b.isActive).length;

  return (
    <AdminLayout
      pageTitle="Brands &amp; Suppliers"
      breadcrumbs={[{ label: "Catalog", href: "/admin/products" }, { label: "Brands" }]}
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Brand Directory &amp; Manufacturers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your verified producers, house labels, and supplier partner brands.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Brand</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Brands</span>
            <Tag size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {brands.length}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Brands</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Catalog Products</span>
            <Package size={16} className="text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {products.length} items
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search brands by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBrands.map((brand) => {
          const brandProductCount = products.filter((p) => p.brandId === brand.id).length;

          return (
            <div
              key={brand.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                      {brand.logoUrl ? (
                        <img
                          src={brand.logoUrl}
                          alt={brand.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Tag size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {brand.name}
                        </h3>
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            brand.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                          }`}
                          title={brand.isActive ? "Active" : "Inactive"}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">/{brand.slug}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${
                      brand.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                  {brand.description || "No official description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Package size={12} className="text-slate-400" />
                    {brandProductCount} product{brandProductCount !== 1 ? "s" : ""}
                  </span>

                  {brand.websiteUrl && (
                    <>
                      <span>•</span>
                      <a
                        href={brand.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        <Globe size={11} />
                        <span className="truncate max-w-[130px]">Official Site</span>
                        <ExternalLink size={10} />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] text-slate-400">Order: #{brand.sortOrder || 0}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(brand)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Edit brand"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id, brand.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete brand"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBrands.length === 0 && (
          <div className="col-span-full p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center">
            <Tag size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No brands found
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No brands matching your search filter. You can add a new brand or supplier above.
            </p>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Tag size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {editingId ? "Edit Brand Details" : "Add New Brand"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure brand profile &amp; logo</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingId && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    placeholder="e.g. Sundarban Naturals"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. sundarban-naturals"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {logoUrl && (
                    <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center p-0.5">
                      <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website / Storefront Link
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://brandwebsite.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Origin Story
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about quality, sources, and organic certifications..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <input
                    type="checkbox"
                    id="isActiveBrand"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="isActiveBrand" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active &amp; Visible in Store
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{saveMutation.isPending ? "Saving..." : "Save Brand"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
