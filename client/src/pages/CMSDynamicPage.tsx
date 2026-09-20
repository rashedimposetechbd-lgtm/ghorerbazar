import React from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { FileText, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CMSDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = trpc.storefront.pageBySlug.useQuery({ slug: slug || "" });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back to Store</span>
        </a>

        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-slate-400">
            Loading page...
          </div>
        ) : !page ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
            <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
            <p className="text-xs text-slate-500 mt-1">
              The page you are looking for does not exist or has been unpublished.
            </p>
          </div>
        ) : (
          <article className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
              {page.title}
            </h1>
            <div className="text-xs text-slate-400 pb-6 mb-6 border-b border-slate-100">
              Last updated: {new Date(page.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {page.content}
            </div>
          </article>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Ghorer Bazar. 100% Pure &amp; Organic Food in Bangladesh.</p>
      </footer>
    </div>
  );
}
