import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Star,
  ExternalLink,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";

export default function CategoriesView() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [newSubcatName, setNewSubcatName] = useState("");

  const { data: categories = [], refetch, isLoading } = trpc.admin.categories.list.useQuery();
  const { data: products = [] } = trpc.admin.products.list.useQuery();

  const saveMutation = trpc.admin.categories.save.useMutation();
  const deleteMutation = trpc.admin.categories.delete.useMutation();

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80");
    setIcon("🍯");
    setBannerUrl("");
    setSortOrder(categories.length + 1);
    setIsFeatured(true);
    setIsActive(true);
    setSubcategories([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setIcon(cat.icon || "");
    setBannerUrl(cat.bannerUrl || "");
    setSortOrder(cat.sortOrder || 0);
    setIsFeatured(Boolean(cat.isFeatured));
    setIsActive(Boolean(cat.isActive));
    setSubcategories(cat.subcategories || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await saveMutation.mutateAsync({
        id: editingId || undefined,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        imageUrl: imageUrl || null,
        icon,
        bannerUrl,
        sortOrder,
        isFeatured,
        isActive,
        subcategories,
      });

      toast.success(editingId ? "Category updated!" : "Category created!");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Category deleted");
      refetch();
    } catch (err: any) {
      toast.error("Error deleting category");
    }
  };

  const addSubcategory = () => {
    if (!newSubcatName.trim()) return;
    const newSub = {
      id: Date.now(),
      categoryId: editingId || 0,
      name: newSubcatName.trim(),
      slug: newSubcatName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: "",
      sortOrder: subcategories.length + 1,
      isActive: true,
    };
    setSubcategories([...subcategories, newSub]);
    setNewSubcatName("");
  };

  const removeSubcategory = (subId: number) => {
    setSubcategories(subcategories.filter((s) => s.id !== subId));
  };

  return (
    <AdminLayout
      pageTitle="Categories &amp; Subcategories"
      breadcrumbs={[{ label: "Catalog" }, { label: "Categories" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Product Categories Hierarchy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize the storefront navigation, filter trees, and homepage category showcases.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          const subCount = cat.subcategories?.length || 0;

          return (
            <div
              key={cat.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                        {cat.icon || "📦"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">/{cat.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {cat.isFeatured && (
                      <span className="p-1 text-amber-500" title="Featured on Homepage">
                        <Star size={16} fill="currentColor" />
                      </span>
                    )}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cat.isActive ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      title={cat.isActive ? "Active" : "Inactive"}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                  {cat.description || "No description provided."}
                </p>

                {/* Subcategories tags */}
                {subCount > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cat.subcategories?.slice(0, 4).map((sub: any) => (
                      <span
                        key={sub.id}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {subCount > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{subCount - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {productCount} product{productCount === 1 ? "" : "s"}
                </span>
                <div className="flex items-center gap-1">
                  <a
                    href={`/category/${cat.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    title="View category page"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Category" : "Create Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Name *
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
                    placeholder="e.g. Honey &amp; Bee Pollen"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
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
                    placeholder="honey"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Icon Emoji / Short Symbol
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🍯"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pure organic honey directly sourced from Sundarbans, mustard fields and black seed..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Feature on Homepage Showcase</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Active &amp; Visible</span>
                </label>
              </div>

              {/* SUBCATEGORIES MANAGEMENT */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subcategories
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubcatName}
                    onChange={(e) => setNewSubcatName(e.target.value)}
                    placeholder="New subcategory name..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSubcategory}
                    className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Add Subcategory
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{sub.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSubcategory(sub.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
