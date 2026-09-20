import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  Search,
  Clock,
  User,
  ShieldCheck,
  Tag,
  RefreshCw,
} from "lucide-react";

export default function ActivityLogsView() {
  const [search, setSearch] = useState("");
  const { data: logs = [], refetch, isLoading } = trpc.admin.activityLogs.list.useQuery();

  const filteredLogs = logs.filter(
    (l: any) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      (l.adminName && l.adminName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout
      pageTitle="System Activity &amp; Audit Logs"
      breadcrumbs={[{ label: "System" }, { label: "Audit Logs" }]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Audit Trail &amp; Operator Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable log of all product edits, inventory adjustments, order status updates, and setting changes.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs by action, admin, or target..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
        />
      </div>

      {/* LOGS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No audit logs recorded yet.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      By: <strong className="text-slate-600 dark:text-slate-300">{log.adminName}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
