import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, User } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, demoLogin, isLoading } = useAdminAuth();
  const { data: settings } = trpc.storefront.settings.useQuery();
  const siteName = settings?.siteName || "Babui Shop";
  const [email, setEmail] = useState("admin@ghorerbazar.com");
  const [password, setPassword] = useState("admin123456");
  const [errorMsg, setErrorMsg] = useState("");
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return (typeof window !== "undefined" ? localStorage.getItem("gb_api_url") : "") || "";
  });

  const handleSaveApiUrl = () => {
    if (customApiUrl.trim()) {
      localStorage.setItem("gb_api_url", customApiUrl.trim());
    } else {
      localStorage.removeItem("gb_api_url");
    }
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const res = await login(email, password);
    if (res.success) {
      setLocation("/admin/dashboard");
    } else {
      setErrorMsg(res.message || "Invalid credentials");
    }
  };

  const handleQuickDemo = async (role: any) => {
    setErrorMsg("");
    const res = await demoLogin(role);
    if (res.success) {
      setLocation("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Brand identity header */}
        <div className="text-center mb-8">
          {settings?.siteLogo ? (
            <img src={settings.siteLogo} alt={siteName} className="w-14 h-14 object-contain rounded-2xl mx-auto mb-3 shadow-lg" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/40 mb-3">
              {siteName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white">{siteName}</h1>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-1">
            Back Office &amp; CMS Portal
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="admin@ghorerbazar.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In to Admin Panel"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Role Switcher for Testing */}
        <div className="mt-8 pt-6 border-t border-slate-700/60">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick One-Click Demo Logins
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo("super_admin")}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-xs font-medium text-slate-200 transition-colors text-left flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">Super Admin</span>
            </button>
            <button
              onClick={() => handleQuickDemo("product_manager")}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-xs font-medium text-slate-200 transition-colors text-left flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="truncate">Product Mgr</span>
            </button>
            <button
              onClick={() => handleQuickDemo("order_manager")}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-xs font-medium text-slate-200 transition-colors text-left flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="truncate">Order &amp; Ship Mgr</span>
            </button>
            <button
              onClick={() => handleQuickDemo("manager")}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-xs font-medium text-slate-200 transition-colors text-left flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
              <span className="truncate">Store Manager</span>
            </button>
          </div>
        </div>

        {/* Backend / Netlify Connection Settings */}
        <div className="mt-6 pt-4 border-t border-slate-700/40 text-center">
          <button
            type="button"
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showApiConfig ? "Hide API Server Settings" : "Configure Backend API URL"}
          </button>

          {showApiConfig && (
            <div className="mt-3 p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-left space-y-2">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Backend API Server Base URL
              </label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://your-backend.run.app"
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
                >
                  Save &amp; Reload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomApiUrl("https://ais-dev-fla4gi37b6w6gqko6ziase-45369408487.asia-southeast1.run.app");
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700"
                >
                  Use Live Cloud Run
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            &larr; Return to Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
