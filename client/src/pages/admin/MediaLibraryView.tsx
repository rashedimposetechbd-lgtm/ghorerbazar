import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function MediaLibraryView() {
  const { data: media = [], refetch, isLoading } = trpc.admin.media.list.useQuery();
  const deleteMutation = trpc.admin.media.delete.useMutation();

  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredMedia = media.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      await new Promise((resolve) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(",")[1];
            const response = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                base64Data: base64,
              }),
            });
            const res = await response.json();
            if (res.success) {
              toast.success(`Uploaded ${file.name}`);
            }
          } catch (err) {
            toast.error(`Failed to upload ${file.name}`);
          }
          resolve(true);
        };
        reader.readAsDataURL(file);
      });
    }

    setIsUploading(false);
    refetch();
  };

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Media deleted");
      refetch();
    } catch (err) {
      toast.error("Error deleting media");
    }
  };

  return (
    <AdminLayout
      pageTitle="Media Assets &amp; File Manager"
      breadcrumbs={[{ label: "Content" }, { label: "Media Library" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Media Storage &amp; Asset Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload product photos, category icons, banner graphics, and copy asset URLs.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <label className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all">
            <Upload size={16} />
            <span>{isUploading ? "Uploading..." : "Upload Images"}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter files by name..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
        />
      </div>

      {/* MEDIA GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((file) => (
          <div
            key={file.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyToClipboard(file.url, file.id)}
                  className="p-2 bg-white text-slate-800 rounded-xl shadow hover:bg-emerald-50"
                  title="Copy direct URL"
                >
                  {copiedId === file.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 bg-white text-rose-600 rounded-xl shadow hover:bg-rose-50"
                  title="Delete file"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="p-2.5">
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{file.fileSize || "Image"}</span>
                <button
                  onClick={() => copyToClipboard(file.url, file.id)}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold"
                >
                  {copiedId === file.id ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
