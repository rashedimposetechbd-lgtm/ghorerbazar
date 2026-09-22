import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, ShoppingCart, Menu, X, Phone, Heart, LogIn, Sun, Moon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationProps {
  cartItemCount?: number;
}

export default function Navigation({ cartItemCount = 0 }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const { data: settings } = trpc.storefront.settings.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: searchData } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const siteName = settings?.siteName || 'Babui Shop';
  const siteTitle = settings?.siteTitle || 'Pure & Natural';
  const sitePhone = settings?.sitePhone || '+8801629863029';
  const announcement = settings?.announcementText || `Free delivery over ৳${settings?.freeShippingThreshold ?? 1500} • Support: ${sitePhone}`;

  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteTitle ? `${settings.siteName} | ${settings.siteTitle}` : settings.siteName;
    }
  }, [settings?.siteName, settings?.siteTitle]);

  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData);
      setShowResults(true);
    }
  }, [searchData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const featuredCategories = [
    'Oil & Ghee',
    'Honey',
    'Dates',
    'Spices',
    'Nuts & Seeds',
    'Beverage',
    'Rice',
    'Flours & Lentils',
    'Organic',
    'Functional Food',
  ];

  return (
    <nav className="w-full">
      <div className="gb-topbar bg-emerald-800 text-emerald-100 text-xs py-1.5 border-b border-emerald-700/50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="font-medium truncate">{announcement}</span>
          <div className="gb-topbar__links hidden sm:flex items-center gap-4 text-[11px]">
            <a href={`tel:${sitePhone}`} className="hover:text-white transition-colors">Call us</a>
            <Link href="/page/contact-us" className="hover:text-white transition-colors">Support</Link>
            <Link href="/combos" className="hover:text-white transition-colors">Offer Zone</Link>
          </div>
        </div>
      </div>

      <header className="gb-header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4 flex items-center justify-between py-3 gap-4">
          <Link href="/" className="gb-brand flex items-center gap-3 shrink-0" aria-label={`${siteName} home`}>
            {settings?.siteLogo ? (
              <img src={settings.siteLogo} alt={siteName} className="h-9 w-auto object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
                {siteName.charAt(0)}
              </div>
            )}
            <div className="gb-brand__text flex flex-col">
              <strong className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{siteName}</strong>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{siteTitle}</span>
            </div>
          </Link>

          <div ref={searchRef} className="gb-search hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search honey, ghee, oil, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-colors pl-9"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />

            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50">
                {searchResults.slice(0, 8).map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div
                      className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setShowResults(false);
                      }}
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{product.name}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        ৳{parseFloat(product.discountPrice || product.price).toFixed(0)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="gb-actions flex items-center gap-2.5 shrink-0">
            <a href={`tel:${sitePhone}`} className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors">
              <Phone size={14} className="text-emerald-600" /> {sitePhone}
            </a>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            <Link href="/cart" className="p-2 rounded-xl relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            <button type="button" className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsSearchOpen(!isSearchOpen)} aria-label="Search">
              <Search size={18} />
            </button>

            <button type="button" className="p-2 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3 md:hidden relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, honey, ghee, dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 pr-10 text-xs outline-none text-slate-900 dark:text-white shadow-xs"
              autoFocus
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
              {searchResults.slice(0, 6).map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div
                    className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
                      {product.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      ৳{parseFloat(product.discountPrice || product.price).toFixed(0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="gb-category-band bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 py-2">
        <div className="container mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          {featuredCategories.map((cat) => {
            const category = categories?.find((c) => c.name === cat);
            const isActive = location === `/category/${category?.id}`;
            return (
              <Link
                key={cat}
                href={`/category/${category?.id || 1}`}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base">
              {siteName.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{siteName}</h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{siteTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/combos"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Combo Packages</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                SAVE BIG
              </span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart size={15} />
                Shopping Cart
              </span>
              {cartItemCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Product Categories
            </p>
            <div className="space-y-0.5">
              {featuredCategories.map((cat) => {
                const category = categories?.find((c) => c.name === cat);
                return (
                  <Link
                    key={cat}
                    href={`/category/${category?.id || 1}`}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/60 hover:text-emerald-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <a
              href={`tel:${sitePhone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40"
            >
              <Phone size={14} /> Call Support: {sitePhone}
            </a>
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 md:hidden shadow-lg flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location === '/' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">Home</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="text-[10px]">Categories</span>
        </button>

        <Link
          href="/combos"
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location === '/combos' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="absolute -top-1 right-1 px-1 py-0.2 rounded-full text-[8px] font-black bg-rose-500 text-white uppercase leading-none">
            Hot
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-[10px]">Combos</span>
        </Link>

        <Link
          href="/cart"
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors ${
            location === '/cart' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
          <ShoppingCart size={20} />
          <span className="text-[10px]">Cart</span>
        </Link>

        <a
          href={`tel:${sitePhone}`}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Phone size={19} className="text-emerald-600" />
          <span className="text-[10px]">Call</span>
        </a>
      </div>
    </nav>
  );
}
