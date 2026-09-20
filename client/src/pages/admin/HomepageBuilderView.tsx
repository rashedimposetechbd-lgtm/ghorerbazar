import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Home,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function HomepageBuilderView() {
  const { data: initialSections = [], refetch, isLoading } = trpc.admin.homepage.getSections.useQuery();
  const updateSectionsMutation = trpc.admin.homepage.updateSections.useMutation();

  const [sections, setSections] = useState<any[]>([]);

  React.useEffect(() => {
    if (initialSections.length > 0 && sections.length === 0) {
      setSections([...initialSections].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [initialSections]);

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;

    // Recalculate sort orders
    copy.forEach((sec, idx) => {
      sec.sortOrder = idx + 1;
    });

    setSections(copy);
  };

  const toggleSection = (index: number) => {
    const copy = [...sections];
    copy[index].isEnabled = !copy[index].isEnabled;
    setSections(copy);
  };

  const updateTitle = (index: number, title: string) => {
    const copy = [...sections];
    copy[index].title = title;
    setSections(copy);
  };

  const updateLimit = (index: number, limit: number) => {
    const copy = [...sections];
    copy[index].productLimit = limit;
    setSections(copy);
  };

  const handleSave = async () => {
    try {
      await updateSectionsMutation.mutateAsync(sections);
      toast.success("Homepage layout successfully updated!");
      refetch();
    } catch (err: any) {
      toast.error("Failed to update layout");
    }
  };

  return (
    <AdminLayout
      pageTitle="Dynamic Homepage Layout Builder"
      breadcrumbs={[{ label: "Storefront" }, { label: "Homepage" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Homepage Section Customizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arrange, enable, or disable homepage modular blocks, headlines, and product density.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
          >
            <span>Live Preview</span>
            <ExternalLink size={13} />
          </a>
          <button
            onClick={handleSave}
            disabled={updateSectionsMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            <Save size={15} />
            <span>{updateSectionsMutation.isPending ? "Saving..." : "Save Layout"}</span>
          </button>
        </div>
      </div>

      {/* DRAG & REORDER LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-4 max-w-4xl">
        <div className="space-y-3">
          {sections.map((sec, index) => (
            <div
              key={sec.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                sec.isEnabled
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700 opacity-60"
              }`}
            >
              {/* Order index and name */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {sec.sortOrder}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => updateTitle(index, e.target.value)}
                      className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none w-full max-w-xs"
                    />
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {sec.sectionKey}
                    </span>
                  </div>
                  {sec.subtitle && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{sec.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Product Limit */}
              {sec.sectionKey !== "hero_slider" && sec.sectionKey !== "featured_categories" && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span>Display limit:</span>
                  <select
                    value={sec.productLimit || 8}
                    onChange={(e) => updateLimit(index, Number(e.target.value))}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value={4}>4 items</option>
                    <option value={8}>8 items</option>
                    <option value={12}>12 items</option>
                    <option value={16}>16 items</option>
                  </select>
                </div>
              )}

              {/* Action Buttons: Enable toggle & move up/down */}
              <div className="flex items-center gap-1 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => toggleSection(index)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    sec.isEnabled
                      ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      : "text-slate-400 hover:bg-slate-200"
                  }`}
                  title={sec.isEnabled ? "Disable section" : "Enable section"}
                >
                  {sec.isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveSection(index, "up")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                  title="Move section up"
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, "down")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                  title="Move section down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
