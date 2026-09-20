import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  RefreshCw,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  const { data: settings } = trpc.storefront.settings.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const siteName = settings?.siteName || "Babui Shop";
  const siteTagline = settings?.siteTitle || "100% Pure and Safe Food in Bangladesh";
  const phone = settings?.sitePhone || "+8801629863029";
  const email = settings?.siteEmail || "contact@babuishop.com";
  const address = settings?.siteAddress || "House 12, Road 4, Rampura, Dhaka - 1219, Bangladesh";
  const businessHours = settings?.businessHours || "Saturday - Thursday: 9:00 AM - 9:00 PM";
  const freeShipping = settings?.freeShippingThreshold ?? 1500;

  return (
    <footer className="bg-slate-900 text-slate-200 pt-16 pb-10 border-t border-slate-800">
      {/* Value Proposition Banners */}
      <div className="container mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Delivery Available</h4>
              <p className="text-xs text-slate-400 mt-0.5">Orders over ৳{freeShipping.toLocaleString()} nationwide</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Pure &amp; Authentic</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sourced directly from verified farmers</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Full refund or replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">{phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {settings?.siteLogo ? (
                <img src={settings.siteLogo} alt={siteName} className="h-9 w-auto object-contain rounded-lg" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {siteName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-xl text-white tracking-tight">{siteName}</span>
                <span className="text-xs text-emerald-400 font-medium">{siteTagline}</span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Your premier destination for unadulterated cold pressed oils, pure forest honey, fresh Madinah dates, aromatic spices, and organic groceries directly delivered to your door.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              )}
              {settings?.siteWhatsApp && (
                <a
                  href={`https://wa.me/${settings.siteWhatsApp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`} className="hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/combos" className="hover:text-emerald-400 transition-colors">
                  Combo Offers &amp; Bundles
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care / Policy Pages */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/page/contact-us" className="hover:text-emerald-400 transition-colors">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <Link href="/page/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/page/shipping-policy" className="hover:text-emerald-400 transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/page/return-refund" className="hover:text-emerald-400 transition-colors">
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/page/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/about-us" className="hover:text-emerald-400 transition-colors">
                  About Our Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact &amp; Store</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-400 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-emerald-400 transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-emerald-400 transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Live Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved. 100% Pure Foods Bangladesh.</p>
          <div className="flex items-center gap-4">
            <Link href="/page/privacy-policy" className="hover:text-slate-400">Privacy</Link>
            <span>•</span>
            <Link href="/page/shipping-policy" className="hover:text-slate-400">Shipping</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-emerald-400 text-emerald-500/80 font-medium">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
