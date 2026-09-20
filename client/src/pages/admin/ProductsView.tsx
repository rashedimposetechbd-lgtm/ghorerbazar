import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  ArrowUpDown,
  Download,
  Check,
  Percent,
  Layers,
  Sparkles,
  Zap,
  Tag,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

interface VariantInput {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  weight?: string;
}

export default function ProductsView() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "draft" | "inactive">("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stockParam = params.get("stockStatus");
      if (stockParam === "low_stock" || stockParam === "out_of_stock" || stockParam === "in_stock") {
        return stockParam;
      }
    }
    return "all";
  });
  const [selectedFlag, setSelectedFlag] = useState<string>("");

  // Bulk Selection
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"status" | "price" | "category" | "delete">("status");
  const [bulkStatusValue, setBulkStatusValue] = useState<"active" | "draft" | "inactive">("active");
  const [bulkPriceChange, setBulkPriceChange] = useState<number>(10);
  const [bulkCategoryId, setBulkCategoryId] = useState<number>(1);

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "variants" | "media" | "flags" | "seo">("general");

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brandId, setBrandId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number>(1);
  const [subcategoryId, setSubcategoryId] = useState<number | undefined>();
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>();
  const [costPrice, setCostPrice] = useState<number | undefined>();
  const [stock, setStock] = useState<number>(50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [weight, setWeight] = useState("1 kg");
  const [unit, setUnit] = useState("kg");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Product Flags
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isBestCollection, setIsBestCollection] = useState(false);
  const [isOffered, setIsOffered] = useState(false);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const [isOrganic, setIsOrganic] = useState(true);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [status, setStatus] = useState<"active" | "draft" | "inactive">("active");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // TRPC queries
  const { data: products = [], refetch, isLoading } = trpc.admin.products.list.useQuery({
    search: search || undefined,
    categoryId: selectedCategory,
    brandId: selectedBrand,
    status: selectedStatus,
    stockStatus: selectedStockStatus,
    flag: selectedFlag || undefined,
  });

  const { data: categories = [] } = trpc.admin.categories.list.useQuery();
  const { data: brands = [] } = trpc.admin.brands.list.useQuery();

  const saveMutation = trpc.admin.products.save.useMutation();
  const deleteMutation = trpc.admin.products.delete.useMutation();
  const bulkUpdateMutation = trpc.admin.products.bulkUpdate.useMutation();

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setSku(`GB-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode("");
    setBrandId(undefined);
    setCategoryId(categories[0]?.id || 1);
    setSubcategoryId(undefined);
    setShortDescription("");
    setFullDescription("");
    setPrice(500);
    setDiscountPrice(undefined);
    setCostPrice(350);
    setStock(50);
    setLowStockThreshold(10);
    setWeight("1 kg");
    setUnit("kg");
    setVideoUrl("");
    setImageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80");
    setGalleryImages([]);
    setIsNewArrival(false);
    setIsBestSelling(false);
    setIsTrending(false);
    setIsFeatured(true);
    setIsBestCollection(false);
    setIsOffered(false);
    setIsFreeDelivery(false);
    setIsOrganic(true);
    setIsFlashSale(false);
    setStatus("active");
    setMetaTitle("");
    setMetaDescription("");
    setVariants([]);
    setActiveTab("general");
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setSlug(p.slug || "");
    setSku(p.sku || "");
    setBarcode(p.barcode || "");
    setBrandId(p.brandId);
    setCategoryId(p.categoryId);
    setSubcategoryId(p.subcategoryId);
    setShortDescription(p.shortDescription || "");
    setFullDescription(p.fullDescription || "");
    setPrice(p.price);
    setDiscountPrice(p.discountPrice || undefined);
    setCostPrice(p.costPrice || undefined);
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold || 10);
    setWeight(p.weight || "1 kg");
    setUnit(p.unit || "kg");
    setVideoUrl(p.videoUrl || "");
    setImageUrl(p.imageUrl);
    setGalleryImages(p.galleryImages || []);
    setIsNewArrival(Boolean(p.isNewArrival));
    setIsBestSelling(Boolean(p.isBestSelling));
    setIsTrending(Boolean(p.isTrending));
    setIsFeatured(Boolean(p.isFeatured));
    setIsBestCollection(Boolean(p.isBestCollection));
    setIsOffered(Boolean(p.isOffered));
    setIsFreeDelivery(Boolean(p.isFreeDelivery));
    setIsOrganic(Boolean(p.isOrganic));
    setIsFlashSale(Boolean(p.isFlashSale));
    setStatus(p.status || "active");
    setMetaTitle(p.metaTitle || "");
    setMetaDescription(p.metaDescription || "");
    setVariants(p.variants || []);
    setActiveTab("general");
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !imageUrl) {
      toast.error("Please provide a valid product name, price, and primary image URL.");
      return;
    }

    try {
      const discountPercentage =
        discountPrice && discountPrice < price
          ? Math.round(((price - discountPrice) / price) * 100)
          : null;

      await saveMutation.mutateAsync({
        id: editingId || undefined,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku,
        barcode,
        brandId,
        categoryId,
        subcategoryId,
        shortDescription,
        fullDescription,
        price,
        discountPrice: discountPrice || null,
        discountPercentage,
        costPrice,
        stock,
        lowStockThreshold,
        weight,
        unit,
        videoUrl,
        imageUrl,
        galleryImages,
        variants,
        isNewArrival,
        isBestSelling,
        isTrending,
        isFeatured,
        isBestCollection,
        isOffered,
        isFreeDelivery,
        isOrganic,
        isFlashSale,
        status,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || shortDescription,
      });

      toast.success(editingId ? "Product updated successfully!" : "New product created!");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Product deleted");
      refetch();
    } catch (err: any) {
      toast.error("Error deleting product");
    }
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((i) => i !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const executeBulkAction = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      if (bulkActionType === "status") {
        await bulkUpdateMutation.mutateAsync({
          ids: selectedProductIds,
          status: bulkStatusValue,
        });
        toast.success(`Updated status for ${selectedProductIds.length} products`);
      } else if (bulkActionType === "price") {
        await bulkUpdateMutation.mutateAsync({
          ids: selectedProductIds,
          priceModifierPercentage: bulkPriceChange,
        });
        toast.success(`Adjusted prices for ${selectedProductIds.length} products`);
      } else if (bulkActionType === "category") {
        await bulkUpdateMutation.mutateAsync({
          ids: selectedProductIds,
          categoryId: bulkCategoryId,
        });
        toast.success(`Moved ${selectedProductIds.length} products to new category`);
      } else if (bulkActionType === "delete") {
        if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} products?`)) return;
        await bulkUpdateMutation.mutateAsync({
          ids: selectedProductIds,
          delete: true,
        });
        toast.success(`Deleted ${selectedProductIds.length} products`);
      }
      setSelectedProductIds([]);
      setShowBulkModal(false);
      refetch();
    } catch (err: any) {
      toast.error("Bulk action failed");
    }
  };

  const exportProductsCSV = () => {
    const headers = ["ID", "Name", "SKU", "Category", "Price", "DiscountPrice", "Stock", "Status"];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      categories.find((c) => c.id === p.categoryId)?.name || p.categoryId,
      p.price,
      p.discountPrice || "",
      p.stock,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ghorer_bazar_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        name: "500 gm",
        sku: `${sku}-500G`,
        price: Math.round(price * 0.55),
        stock: 25,
        weight: "500 gm",
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  return (
    <AdminLayout
      pageTitle="Products &amp; Inventory"
      breadcrumbs={[{ label: "Catalog" }, { label: "Products" }]}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Catalog &amp; Stock Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage all natural products, pricing, multi-weight variants, badges and inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportProductsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all"
            title="Export CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU, barcode..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; Threshold)</option>
              <option value="low_stock">Low Stock Warning</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Flags Filter */}
          <div>
            <select
              value={selectedFlag}
              onChange={(e) => setSelectedFlag(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Badges &amp; Tags</option>
              <option value="isBestSelling">Best Selling</option>
              <option value="isNewArrival">New Arrivals</option>
              <option value="isTrending">Trending Items</option>
              <option value="isOffered">Offered Items</option>
              <option value="isFlashSale">Flash Sale Items</option>
              <option value="isOrganic">100% Organic</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Shows when items selected) */}
        {selectedProductIds.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl">
              <Check size={14} />
              <span>{selectedProductIds.length} product(s) selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setBulkActionType("status");
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Change Status
              </button>
              <button
                onClick={() => {
                  setBulkActionType("price");
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Adjust Price %
              </button>
              <button
                onClick={() => {
                  setBulkActionType("category");
                  setShowBulkModal(true);
                }}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors"
              >
                Move Category
              </button>
              <button
                onClick={() => {
                  setBulkActionType("delete");
                  executeBulkAction();
                }}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-medium rounded-xl transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCTS DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Discount</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Tags &amp; Badges</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No products matched your search or filters.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const cat = categories.find((c) => c.id === prod.categoryId);
                  const isLow = prod.stock > 0 && prod.stock <= prod.lowStockThreshold;
                  const isOut = prod.stock === 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(prod.id)}
                          onChange={() => toggleSelectOne(prod.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                              {prod.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span>SKU: {prod.sku}</span>
                              {prod.weight && <span>• {prod.weight}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {cat?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            ৳{prod.discountPrice || prod.price}
                          </span>
                          {prod.discountPrice && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="line-through text-slate-400">৳{prod.price}</span>
                              <span className="text-rose-600 font-semibold">
                                -{prod.discountPercentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOut
                                ? "bg-rose-500"
                                : isLow
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span
                            className={`font-semibold ${
                              isOut
                                ? "text-rose-600 dark:text-rose-400"
                                : isLow
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {prod.stock} {prod.unit || "unit"}
                          </span>
                        </div>
                        {isLow && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">
                            Alert &le; {prod.lowStockThreshold}
                          </span>
                        )}
                        {isOut && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium block">
                            Out of stock
                          </span>
                        )}
                      </td>

                      {/* Tags & Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {prod.isBestSelling && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[9px] font-semibold">
                              Best Seller
                            </span>
                          )}
                          {prod.isNewArrival && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[9px] font-semibold">
                              New
                            </span>
                          )}
                          {prod.isTrending && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[9px] font-semibold">
                              Trending
                            </span>
                          )}
                          {prod.isFlashSale && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[9px] font-semibold">
                              Flash
                            </span>
                          )}
                          {prod.isOrganic && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[9px] font-semibold">
                              100% Pure
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            prod.status === "active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : prod.status === "draft"
                              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <a
                            href={`/product/${prod.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View on Customer Site"
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Product" : "Create New Product"}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the attributes and customize presentation for Ghorer Bazar.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab("general")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "general"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "pricing"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Pricing &amp; Stock
              </button>
              <button
                onClick={() => setActiveTab("variants")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "variants"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Variants ({variants.length})
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "media"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Images &amp; Gallery
              </button>
              <button
                onClick={() => setActiveTab("flags")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "flags"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Badges &amp; Placement
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "seo"
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                SEO Meta
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: General Info */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (!editingId) {
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                          }
                        }}
                        placeholder="e.g., Sundarban Wild Flower Honey (সুন্দরবনের মধু)"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Product Slug (URL)
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="sundarban-wild-honey"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        SKU (Stock Keeping Unit)
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Barcode / EAN
                      </label>
                      <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="e.g. 894123456789"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Publish Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="inactive">Inactive / Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Primary Category *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Brand
                      </label>
                      <select
                        value={brandId || ""}
                        onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">Ghorer Bazar In-House</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Short Description (Highlights / Key Benefits)
                    </label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="100% natural, raw & unprocessed organic honey harvested from deep Sundarbans forest..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Product Description &amp; Health Benefits
                    </label>
                    <textarea
                      rows={5}
                      value={fullDescription}
                      onChange={(e) => setFullDescription(e.target.value)}
                      placeholder="Detailed origin, processing, nutritional facts, and usage instructions..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Video URL (YouTube embed or product demo)
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Pricing & Stock */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Regular Price (৳ BDT) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Discount Sale Price (৳ BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountPrice || ""}
                        onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Leave blank if no discount"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Cost of Goods (৳ BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={costPrice || ""}
                        onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="For profit margins reporting"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Low Stock Alert At
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Weight Display
                      </label>
                      <input
                        type="text"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g. 500 gm / 1 kg"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Unit
                      </label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="gm">gm</option>
                        <option value="liter">liter</option>
                        <option value="ml">ml</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Variants */}
              {activeTab === "variants" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Product Weight / Package Variants
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Offer multiple sizes like 500gm, 1kg, 2kg with tailored pricing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Add Size Option</span>
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                      No variants added. This product uses a single standard size.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {variants.map((v, idx) => (
                        <div
                          key={v.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-5 gap-2 items-center text-xs"
                        >
                          <div>
                            <label className="block text-[10px] text-slate-400">Size / Name</label>
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].name = e.target.value;
                                setVariants(copy);
                              }}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">SKU</label>
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].sku = e.target.value;
                                setVariants(copy);
                              }}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Price (৳)</label>
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].price = Number(e.target.value);
                                setVariants(copy);
                              }}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Stock</label>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[idx].stock = Number(e.target.value);
                                setVariants(copy);
                              }}
                              className="w-full px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="flex justify-end pt-3">
                            <button
                              type="button"
                              onClick={() => removeVariant(v.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Media & Gallery */}
              {activeTab === "media" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Featured Image URL *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                    {imageUrl && (
                      <div className="mt-2">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-28 h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Additional Gallery Images
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="url"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        placeholder="Add secondary image URL..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newGalleryUrl) {
                            setGalleryImages([...galleryImages, newGalleryUrl]);
                            setNewGalleryUrl("");
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {galleryImages.map((img, i) => (
                        <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Flags & Marketing Placement */}
              {activeTab === "flags" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Toggle dynamic placements to automatically feature this item in specific sections on the homepage.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Featured Products Section
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Show in the main homepage showcase
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBestSelling}
                        onChange={(e) => setIsBestSelling(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Best Selling Products
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Highlight as a customer top-choice
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          New Arrivals
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Display "NEW" badge &amp; feature in fresh releases
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isTrending}
                        onChange={(e) => setIsTrending(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Trending Items
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Include in high-velocity trending carousels
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFlashSale}
                        onChange={(e) => setIsFlashSale(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          Flash Sale Eligible
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Display countdown and flash discounts
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOrganic}
                        onChange={(e) => setIsOrganic(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          100% Pure &amp; Organic
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Add the organic verification badge on the card
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 6: SEO */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={name || "SEO Title"}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Concise snippet for Google search results..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                      Google Search Preview
                    </span>
                    <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      {metaTitle || name || "Product Name"} | Ghorer Bazar
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      https://ghorerbazar.com/product/{slug || "item"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {metaDescription || shortDescription || "Buy 100% natural, unadulterated food products online with fast delivery in Bangladesh."}
                    </p>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ACTION MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Bulk Update ({selectedProductIds.length} Products)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Apply changes simultaneously across all selected products.
            </p>

            {bulkActionType === "status" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Status
                </label>
                <select
                  value={bulkStatusValue}
                  onChange={(e) => setBulkStatusValue(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            {bulkActionType === "price" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Price Adjustment Percentage (%)
                </label>
                <input
                  type="number"
                  value={bulkPriceChange}
                  onChange={(e) => setBulkPriceChange(Number(e.target.value))}
                  placeholder="e.g. 10 for +10%, -5 for -5%"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {bulkActionType === "category" && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Move to Category
                </label>
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkAction}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Apply to Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
