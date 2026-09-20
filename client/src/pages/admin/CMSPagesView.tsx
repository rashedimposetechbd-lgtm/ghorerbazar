import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function CMSPagesView() {
  const { data: pages = [], refetch, isLoading } = trpc.admin.pages.list.useQuery();
  const saveMutation = trpc.admin.pages.save.useMutation();
  const deleteMutation = trpc.admin.pages.delete.useMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("# New Page Title\n\nEnter formatted text, policies, or contact details here.");
    setIsPublished(true);
    setMetaTitle("");
    setMetaDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (page: any) => {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(page.content);
    setIsPublished(Boolean(page.isPublished));
    setMetaTitle(page.metaTitle || "");
    setMetaDescription(page.metaDescription || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      await saveMutation.mutateAsync({
        id: editingId || undefined,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        content,
        isPublished,
        metaTitle: metaTitle || title,
        metaDescription,
      });

      toast.success(editingId ? "Page updated!" : "Page published!");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save page");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Page deleted");
      refetch();
    } catch (err) {
      toast.error("Error deleting page");
    }
  };

  return (
    <AdminLayout
      pageTitle="Content Management (CMS Pages)"
      breadcrumbs={[{ label: "Content" }, { label: "Pages" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Informational &amp; Policy Pages
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, edit, and publish customer care, legal, and company history pages without coding.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <Plus size={16} />
          <span>Create New Page</span>
        </button>
      </div>

      {/* PAGES LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Page Title</th>
                <th className="py-3 px-4">URL Route Slug</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pages.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {p.title}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    /page/{p.slug}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        p.isPublished
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/page/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                        title="Edit Page"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? "Edit Page Content" : "Create New CMS Page"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingId) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                      }
                    }}
                    placeholder="e.g. Terms &amp; Conditions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">URL Route Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="terms-and-conditions"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Page Body Content (Markdown supported)</label>
                <textarea
                  rows={12}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Publish page immediately
                </span>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
